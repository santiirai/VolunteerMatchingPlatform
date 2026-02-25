import { prisma } from '../libs/prisma.js';

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
    const { amountNpr, opportunityId, name, email, purchaseOrderName } = req.body;
    if (!amountNpr) {
      return res.status(400).json({ success: false, message: 'amountNpr is required' });
    }
    const amountPaisa = toPaisa(amountNpr);
    const userId = (req.user && req.user.id) ? req.user.id : null;

    const orderId = `order_${Date.now()}`;
    const orderName = purchaseOrderName || 'Volunteer Donation';

    const body = {
      return_url: `${WEBSITE_URL}/payment-return`,
      website_url: WEBSITE_URL,
      amount: amountPaisa,
      purchase_order_id: orderId,
      purchase_order_name: orderName,
      customer_info: {
        name: name || 'Donor',
        email: email || 'donor@example.com'
      }
    };

    const resp = await fetch(`${API_URL}/api/v2/epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${SECRET_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, message: data?.detail || 'Failed to initiate payment', data });
    }

    const { pidx, payment_url } = data;
    await prisma.payment.create({
      data: {
        pidx,
        status: 'INITIATED',
        amountPaisa,
        userId,
        opportunityId: opportunityId ? Number(opportunityId) : null,
        metadata: {
          name: name || null,
          email: email || null,
          orderId,
          orderName
        }
      }
    });

    res.status(200).json({ success: true, data: { pidx, payment_url } });
  } catch (error) {
    console.error('[Payments] Initiate error:', error);
    res.status(500).json({ success: false, message: 'Payment initiation failed', error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body?.pidx ? req.body : req.query;
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    const payment = await prisma.payment.findUnique({ where: { pidx } });
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

    const updated = await prisma.payment.update({
      where: { pidx },
      data: {
        status: mapped,
        transactionId: txnId,
        metadata: {
          ...(payment.metadata || {}),
          rawVerify: data
        }
      }
    });

    res.status(200).json({ success: true, data: updated });
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
