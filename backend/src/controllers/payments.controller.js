import { prisma } from '../libs/prisma.js';
import mysql from 'mysql2/promise';

const API_URL = process.env.KHALTI_API_URL || 'https://a.khalti.com';
const SECRET_KEY = process.env.KHALTI_SECRET_KEY || '';
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:5174';

const toPaisa = (npr) => {
  const val = Math.round(Number(npr) * 100);
  if (Number.isNaN(val) || val <= 0) throw new Error('Invalid amount');
  return val;
};

export const initiatePayment = async (req, res) => {
  try {
    const { amountNpr, opportunityId, name, email, phone, purchaseOrderName } = req.body;

    console.log('[Payments] Initiating payment for:', { amountNpr, opportunityId, name, email });

    if (!amountNpr) {
      return res.status(400).json({ success: false, message: 'amountNpr is required' });
    }

    let amountPaisa;
    try {
      amountPaisa = toPaisa(amountNpr);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    const userId = (req.user && req.user.id) ? req.user.id : null;
    const orderId = `order_${Date.now()}`;
    const orderName = purchaseOrderName || 'Volunteer Donation';

    const khaltiBody = {
      return_url: `${WEBSITE_URL}/payment-return`,
      website_url: WEBSITE_URL,
      amount: amountPaisa,
      purchase_order_id: orderId,
      purchase_order_name: orderName,
      customer_info: {
        name: name || 'Donor',
        email: email || 'donor@example.com',
        phone: phone || "9800000000"
      }
    };

    console.log('[Payments] Calling Khalti API...');
    const resp = await fetch(`${API_URL}/api/v2/epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${SECRET_KEY}`
      },
      body: JSON.stringify(khaltiBody)
    });

    let data;
    const respText = await resp.text();
    try {
      data = JSON.parse(respText);
    } catch (e) {
      console.error('[Payments] Failed to parse Khalti response:', respText);
      return res.status(500).json({ success: false, message: 'Invalid response from payment gateway' });
    }

    if (!resp.ok) {
      console.error('[Payments] Khalti returned error:', data);
      return res.status(resp.status).json({ success: false, message: data?.detail || 'Failed to initiate payment', data });
    }

    const { pidx, payment_url } = data;
    if (!pidx || !payment_url) {
      console.error('[Payments] Missing pidx or payment_url in response:', data);
      return res.status(500).json({ success: false, message: 'Payment gateway did not return required info' });
    }

    console.log('[Payments] Creating record in database using mysql2 fallback...');
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    try {
      await conn.execute(
        `INSERT INTO payment (pidx, status, amountPaisa, userId, opportunityId, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pidx,
          'INITIATED',
          amountPaisa,
          userId,
          opportunityId ? Number(opportunityId) : null,
          JSON.stringify({
            name: name || null,
            email: email || null,
            phone: phone || null,
            orderId,
            orderName
          })
        ]
      );
    } finally {
      await conn.end();
    }

    console.log('[Payments] Initiation success:', pidx);
    res.status(200).json({ success: true, data: { pidx, payment_url } });
  } catch (error) {
    console.error('[Payments] Critical error during initiation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment initiation',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body?.pidx ? req.body : req.query;
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    const [payment] = await prisma.$queryRawUnsafe(`SELECT * FROM payment WHERE pidx = ?`, pidx);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'COMPLETED' || payment.status === 'FAILED' || payment.status === 'REFUNDED') {
      return res.status(200).json({ success: true, message: 'Payment already verified', data: payment });
    }

    const resp = await fetch(`${API_URL}/api/v2/epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${SECRET_KEY}`
      },
      body: JSON.stringify({ pidx })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: data?.detail || 'Failed to verify payment', data });
    }

    const status = (data.status || '').toUpperCase(); // Completed, Pending, etc.
    const txnId = data.transaction_id || null;
    let mapped = 'PENDING';
    if (status === 'COMPLETED') mapped = 'COMPLETED';
    else if (status === 'FAILED') mapped = 'FAILED';
    else if (status === 'REFUNDED') mapped = 'REFUNDED';

    const updated = await prisma.$executeRawUnsafe(
      `UPDATE payment SET status = ?, transactionId = ?, metadata = ? WHERE pidx = ?`,
      mapped,
      txnId,
      JSON.stringify({
        ...(payment.metadata || {}),
        rawVerify: data
      }),
      pidx
    );

    res.status(200).json({ success: true, data: { ...payment, status: mapped, transactionId: txnId } });
  } catch (error) {
    console.error('[Payments] Verify error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error: error.message });
  }
};


export const paymentCallback = async (req, res) => {
  try {
    const { pidx } = req.body || {};
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required in callback' });
    }
    // Forward to verify for idempotent update
    req.query = { pidx };
    return verifyPayment(req, res);
  } catch (error) {
    console.error('[Payments] Callback error:', error);
    res.status(500).json({ success: false, message: 'Callback handling failed', error: error.message });
  }
};

export const getMyDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const donations = await prisma.$queryRawUnsafe(`
      SELECT p.*, o.title as opportunityTitle, u.name as organizationName
      FROM payment p
      LEFT JOIN opportunity o ON p.opportunityId = o.id
      LEFT JOIN user u ON o.organizationId = u.id
      WHERE p.userId = ? AND p.status = 'COMPLETED'
      ORDER BY p.createdAt DESC
    `, userId);

    res.status(200).json({
      success: true,
      data: donations.map(d => ({
        id: d.id,
        amount: d.amountPaisa / 100,
        opportunityTitle: d.opportunityTitle || 'General Donation',
        organizationName: d.organizationName || 'N/A',
        date: d.createdAt,
        transactionId: d.transactionId,
        metadata: typeof d.metadata === 'string' ? JSON.parse(d.metadata) : d.metadata
      }))
    });
  } catch (error) {
    console.error('[Payments] GetMyDonations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donations' });
  }
};

export const getReceivedDonations = async (req, res) => {
  try {
    const orgId = req.user.id; // Organization is also a User
    const donations = await prisma.$queryRawUnsafe(`
      SELECT p.*, u.name as donorName, u.email as donorEmail, o.title as opportunityTitle
      FROM payment p
      LEFT JOIN user u ON p.userId = u.id
      LEFT JOIN opportunity o ON p.opportunityId = o.id
      WHERE o.organizationId = ? AND p.status = 'COMPLETED'
      ORDER BY p.createdAt DESC
    `, orgId);

    res.status(200).json({
      success: true,
      data: donations.map(d => ({
        id: d.id,
        amount: d.amountPaisa / 100,
        donorName: d.donorName || (typeof d.metadata === 'string' ? JSON.parse(d.metadata).name : d.metadata?.name) || 'Anonymous',
        donorEmail: d.donorEmail || (typeof d.metadata === 'string' ? JSON.parse(d.metadata).email : d.metadata?.email) || 'N/A',
        opportunityTitle: d.opportunityTitle || 'General Donation',
        date: d.createdAt,
        transactionId: d.transactionId
      }))
    });
  } catch (error) {
    console.error('[Payments] GetReceivedDonations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch received donations' });
  }
};

