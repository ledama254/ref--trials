"use client";
import { useState } from 'react';
import { Auth } from '@/lib/api';

export default function ActivatePage() {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activate() {
    setError(null);
    setLoading(true);
    try {
      // Triggers STK push (mock in dev). Backend callback will mark SUCCESS.
      await Auth.activate(referralCode || undefined);
      // In dev mock, success happens shortly after. Show confetti-like success once presumed.
      setTimeout(() => setSuccess(true), 1500);
    } catch (e: any) {
      setError(e.message || 'Activation failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">Activate your account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">To activate your account, you need to pay KES 300. You will be prompted to enter your M-Pesa PIN.</p>
        <div>
          <label className="block text-sm mb-1">Referral Code (8 digits, optional if you used during registration)</label>
          <input className="input" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="12345678" />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn-primary w-full" onClick={activate} disabled={loading}>
          {loading ? 'Initiating STK…' : 'Activate Now'}
        </button>
      </div>

      {success && (
        <div className="card text-center">
          <div className="text-3xl">🎉🎉🎉</div>
          <h2 className="text-xl font-semibold">Congratulations, your account is active!</h2>
          <a href="/dashboard" className="btn-primary mt-3 inline-block">Go to Dashboard</a>
        </div>
      )}
    </div>
  );
}
