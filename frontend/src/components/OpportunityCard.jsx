import React, { useState } from 'react';
import { Calendar, MapPin, Users, HeartHandshake, X, Send } from 'lucide-react';

export default function OpportunityCard({
  opportunity,
  onJoin,
  onView,
  onDonationSubmit,
  volunteersNeeded = 10,
  amountRaised = 0,
  targetAmount = 0,
  donors = [],
  hasApplied = false
}) {
  const [showDonate, setShowDonate] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const joined = opportunity?.applicants || 0;
  const needed = volunteersNeeded;
  const progress = targetAmount > 0 ? Math.min(100, Math.round((amountRaised / targetAmount) * 100)) : 0;

  const handleDonate = async () => {
    if (!donorName || !donorEmail || !amount) {
      alert('Please fill all donation fields');
      return;
    }
    setProcessing(true);
    try {
      if (onDonationSubmit) {
        await onDonationSubmit({
          opportunityId: opportunity.id,
          name: donorName,
          email: donorEmail,
          amount: Number(amount),
          method: 'KHALTI'
        });
      } else {
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch('/api/donations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              opportunityId: opportunity.id,
              name: donorName,
              email: donorEmail,
              amount: Number(amount),
              method: 'KHALTI'
            })
          });
          if (!res.ok) throw new Error('Donation endpoint not available');
        } catch {
          alert('Donation processing is not configured on the server.');
        }
      }
      alert('Thank you for your donation!');
      setShowDonate(false);
      setDonorName('');
      setDonorEmail('');
      setAmount('');
    } catch (e) {
      alert(e.message || 'Failed to donate');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between">
        <div className="pr-4">
          <button
            type="button"
            onClick={onView}
            className="text-left"
            title="View details"
          >
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight hover:text-purple-700 transition-colors line-clamp-2">
              {opportunity?.title}
            </h3>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{opportunity?.date ? new Date(opportunity.date).toLocaleString() : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{opportunity?.location || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{joined}/{needed} volunteers</span>
            </div>
            {opportunity?.organizationName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {opportunity.organizationName}
              </span>
            )}
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          Active
        </span>
      </div>

        <p className="text-gray-700 leading-relaxed line-clamp-2">
          {opportunity?.description}
        </p>

        <div className="h-px bg-gray-100" />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Raised</span>
          <span className="font-semibold text-gray-900">NPR {amountRaised.toLocaleString()} / {targetAmount.toLocaleString()}</span>
        </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: `${progress}%` }} />
        </div>
          {donors && donors.length > 0 && (
            <div className="text-xs text-gray-500">
            Recent donors: {donors.slice(0, 3).map((d) => d.name).join(', ')}{donors.length > 3 ? '…' : ''}
          </div>
        )}
      </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {!hasApplied ? (
            <button
              type="button"
              onClick={onJoin}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Join as Volunteer
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 bg-gray-200 text-gray-600 px-4 py-3 rounded-lg font-semibold cursor-not-allowed inline-flex items-center justify-center"
              title="Already applied"
            >
              Already Applied
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDonate(true)}
            className="flex-1 border border-emerald-300 text-emerald-700 bg-white px-4 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            title="Donate via Khalti"
          >
            <HeartHandshake className="w-4 h-4" />
            Donate to this Opportunity
          </button>
        </div>

      {showDonate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Donate</h4>
              <button type="button" onClick={() => setShowDonate(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount (NPR)</label>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <select className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-purple-500" value="KHALTI" readOnly>
                  <option value="KHALTI">Khalti</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowDonate(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                disabled={processing}
                onClick={handleDonate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {processing ? 'Processing…' : 'Donate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
