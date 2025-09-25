import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata = {
  title: 'Referral Kenya',
  description: 'Earn KES 100 for every friend you invite'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 backdrop-blur bg-white/70 dark:bg-[#0b1020]/70">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
            <Link href="/" className="font-semibold">Referral Kenya</Link>
            <nav className="flex gap-3 items-center">
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="btn-primary">Join Now</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
        <footer className="max-w-6xl mx-auto p-6 text-sm text-gray-500">© {new Date().getFullYear()} Referral Kenya</footer>
      </body>
    </html>
  );
}
