"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard#referrals', label: 'Referrals' },
  { href: '/dashboard#profile', label: 'Profile' },
  { href: '/dashboard#deposit', label: 'Deposit' },
  { href: '/dashboard#withdraw', label: 'Withdraw' },
  { href: '/dashboard#notifications', label: 'Notifications' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-60 shrink-0 md:sticky md:top-20">
      <div className="card p-2">
        {items.map(it => (
          <Link key={it.href} href={it.href} className={`block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 ${pathname === it.href ? 'bg-gray-100 dark:bg-white/10 font-semibold' : ''}`}>
            {it.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
