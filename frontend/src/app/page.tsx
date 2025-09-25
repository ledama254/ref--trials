"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-4">
          Earn KES 100 for every friend you invite
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Join a smart, sleek, Kenyan referral platform with M-Pesa activation. Grow your network and earn instantly.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/register" className="btn-primary">Join Now</Link>
          <Link href="/login" className="px-4 py-2 rounded border dark:border-gray-700">Login</Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Register</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create your account in seconds with your phone number.</p>
        </div>
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Activate</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Pay KES 300 via secure M-Pesa STK push to go live.</p>
        </div>
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Invite & Earn</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Share your code. Earn KES 100 for each activated friend.</p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Success stories</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {["John", "Mary", "Ali"].map((name, i) => (
            <div className="card" key={i}>
              <p className="text-sm text-gray-600 dark:text-gray-300">“{name} invited friends and started earning weekly. Withdrawals on Fridays made it simple.”</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
