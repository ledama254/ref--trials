"use client";
import { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { User } from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [wamount, setWamount] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await User.dashboard();
        setData(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load dashboard');
      } finally { setLoading(false); }
    })();
  }, []);

  async function doDeposit() {
    setMessage(null); setError(null);
    try {
      const amt = Number(amount);
      if (!amt || amt <= 0) return setError('Enter a valid amount');
      const res = await User.deposit(amt);
      setMessage('Deposit STK push sent. Check your phone.');
      setAmount('');
    } catch (e: any) { setError(e.message || 'Deposit failed'); }
  }

  async function doWithdraw() {
    setMessage(null); setError(null);
    try {
      const amt = Number(wamount);
      if (!amt || amt <= 0) return setError('Enter a valid amount');
      const res = await User.withdraw(amt);
      setMessage('Withdrawal requested.');
      setWamount('');
    } catch (e: any) { setError(e.message || 'Withdrawal failed'); }
  }

  const progress = useMemo(() => {
    // Simple gamification progress placeholder: assume target 10 referrals
    const count = (data?.referrals?.length || 0);
    const target = 10;
    return { count, target, pct: Math.min(100, Math.round((count/target)*100)) };
  }, [data]);

  return (
    <div className="md:flex gap-4">
      <Sidebar />
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {loading && <div className="card">Loading…</div>}
        {error && <div className="card text-error">{error}</div>}
        {!!message && <div className="card text-success">{message}</div>}
        {data && (
          <>
            {/* Balance Overview Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="card">
                <div className="text-sm text-gray-500">Deposit Total</div>
                <div className="text-2xl font-bold">KES {data.balances.depositTotal}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500">Earned Money</div>
                <div className="text-2xl font-bold text-green-500">KES {data.balances.earnedMoney}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500">Withdrawable Balance</div>
                <div className="text-2xl font-bold">KES {data.balances.withdrawable}</div>
              </div>
            </div>

            {/* Referral Section */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Invite friends to earn KES 100 each!</div>
                  <div className="text-sm text-gray-500">Send this code to your friends. Each activation earns you 100 KES.</div>
                </div>
                <button className="btn-primary" onClick={() => navigator.clipboard.writeText((data as any)?.referralCode || '')}>Invite Friends</button>
              </div>
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Name</th>
                      <th className="py-2">Earned</th>
                      <th className="py-2">Date Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.referrals.map((r: any) => (
                      <tr key={r.id} className="border-t border-gray-200 dark:border-gray-800">
                        <td className="py-2">{r.fullName}</td>
                        <td className="py-2">KES 100</td>
                        <td className="py-2">{new Date(r.joinedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {data.referrals.length === 0 && (
                      <tr><td className="py-2 text-gray-500" colSpan={3}>No referrals yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-1">Network visualization</div>
                <div className="h-32 rounded bg-gradient-to-r from-primary/10 to-purple-500/10 flex items-center justify-center text-xs text-gray-500">
                  Crowd-style network tree placeholder
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="card">
                <div className="font-semibold">Profile</div>
                <div className="text-sm text-gray-500">Level: {data.level}</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-2 rounded border dark:border-gray-700">Edit Profile</button>
                  <button className="px-3 py-2 rounded border dark:border-gray-700">Upload New Picture</button>
                </div>
              </div>

              {/* Gamification */}
              <div className="card">
                <div className="font-semibold mb-2">Progress Tracker</div>
                <div className="text-sm mb-2">{progress.count}/{progress.target} referrals to unlock KES 1000 bonus</div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded">
                  <div className="h-2 bg-primary rounded" style={{ width: `${progress.pct}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">Badges: Starter</div>
              </div>
            </div>

            {/* Deposit & Withdraw */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="card">
                <div className="font-semibold mb-2">Deposit</div>
                <div className="flex gap-2">
                  <input className="input" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
                  <button className="btn-primary" onClick={doDeposit}>Deposit</button>
                </div>
                <div className="text-xs text-gray-500 mt-2">STK push will be sent to your registered phone.</div>
              </div>
              <div className="card">
                <div className="font-semibold mb-2">Withdraw</div>
                <div className="flex gap-2">
                  <input className="input" placeholder="Amount" value={wamount} onChange={e => setWamount(e.target.value)} />
                  <button className="btn-primary" onClick={doWithdraw}>Withdraw</button>
                </div>
                <div className="text-xs text-gray-500 mt-2">Withdrawals are only available on Fridays and go to your registered phone number.</div>
              </div>
            </div>

            {/* Leaderboard & Notifications */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="card">
                <div className="font-semibold mb-2">Weekly Leaderboard (Top 10)</div>
                <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300">
                  <li>Placeholder Leader #1</li>
                  <li>Placeholder Leader #2</li>
                  <li>Placeholder Leader #3</li>
                </ol>
              </div>
              <div className="card">
                <div className="font-semibold mb-2">Notifications</div>
                <ul className="text-sm space-y-1">
                  {(data.notifications || []).map((n: any) => (
                    <li key={n.id} className="border-b border-gray-200 dark:border-gray-800 pb-1">{n.message}</li>
                  ))}
                  {(!data.notifications || data.notifications.length === 0) && (
                    <li className="text-gray-500">No notifications yet</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
