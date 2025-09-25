"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Auth } from '@/lib/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await Auth.login({ phone, password });
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <form onSubmit={submit} className="space-y-4 card">
        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input className="input" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="07XXXXXXXX" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Please wait…' : 'Login'}</button>
      </form>
      <p className="text-sm text-center">New here? <Link className="underline" href="/register">Create an account</Link></p>
    </div>
  );
}
