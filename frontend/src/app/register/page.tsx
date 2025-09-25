"use client";
import { useState, type FormEvent, type ChangeEvent } from 'react';
import Link from 'next/link';
import { Auth } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) return setError('You must agree to Terms & Conditions');
    if (password !== confirm) return setError('Passwords do not match');
    try {
      setLoading(true);
      await Auth.register({ fullName, phone, password, referralCode: referralCode || undefined });
      window.location.href = '/activate';
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form onSubmit={submit} className="space-y-4 card">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm mb-1">Full Name</label>
          <input id="fullName" className="input" value={fullName} onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} required placeholder="Jane Doe" />
        </div>
        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm mb-1">Phone Number</label>
          <input id="phone" className="input" value={phone} onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)} required placeholder="07XXXXXXXX" />
        </div>
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm mb-1">Password</label>
          <input id="password" type="password" className="input" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required placeholder="••••••••" />
        </div>
        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm" className="block text-sm mb-1">Confirm Password</label>
          <input id="confirm" type="password" className="input" value={confirm} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)} required placeholder="••••••••" />
        </div>
        {/* Upload Profile Picture - visual only placeholder */}
        <div>
          <label htmlFor="profilePic" className="block text-sm mb-1">Upload Profile Picture</label>
          <input id="profilePic" type="file" className="input" accept="image/*" />
          <p className="text-xs text-gray-500 mt-1">Profile image upload is a placeholder in this scaffold.</p>
        </div>
        {/* Referral Code (optional here) */}
        <div>
          <label htmlFor="referralCode" className="block text-sm mb-1">Referral Code (8 digits, optional)</label>
          <input id="referralCode" className="input" value={referralCode} onChange={(e: ChangeEvent<HTMLInputElement>) => setReferralCode(e.target.value)} placeholder="12345678" />
        </div>
        {/* Terms */}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
          <span className="text-sm">I agree to Terms & Conditions</span>
        </label>

        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Please wait…' : 'Register'}</button>
      </form>
      <p className="text-sm text-center">Already have an account? <Link className="underline" href="/login">Login</Link></p>
    </div>
  );
}
