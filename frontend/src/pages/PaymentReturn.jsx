import React, { useEffect, useState } from 'react';

export default function PaymentReturn() {
  const [status, setStatus] = useState('VERIFYING');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get('pidx');
    if (!pidx) {
      setStatus('ERROR');
      setMessage('Missing payment identifier (pidx)');
      return;
    }
    const guardKey = `verified_pidx_${pidx}`;
    if (sessionStorage.getItem(guardKey)) {
      setStatus('COMPLETED');
      setMessage('Payment already verified');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pidx })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setStatus('ERROR');
          setMessage(data.message || 'Verification failed');
          return;
        }
        setDetails(data.data);
        setStatus(data.data.status);
        setMessage('Verification complete');
        sessionStorage.setItem(guardKey, '1');
      } catch (e) {
        setStatus('ERROR');
        setMessage(e.message || 'Network error');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center brand-bg p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status</h1>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="space-y-2 text-sm text-gray-700">
          <div><span className="font-semibold">Status:</span> {status}</div>
          {details && (
            <>
              <div><span className="font-semibold">Amount:</span> NPR {(details.amountPaisa / 100).toLocaleString()}</div>
              <div><span className="font-semibold">Transaction ID:</span> {details.transactionId || 'N/A'}</div>
              <div><span className="font-semibold">Reference:</span> {details.pidx}</div>
            </>
          )}
        </div>
        <div className="mt-6">
          <a href="/" className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg">Go Home</a>
        </div>
      </div>
    </div>
  );
}
