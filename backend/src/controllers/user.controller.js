import dayjs from 'dayjs';
import { z } from 'zod';
import { Payments } from '../services/payments.js';
import { prisma } from '../db/prisma.js';

export async function getMe(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: { id: user.id, fullName: user.fullName, phone: user.phone, referralCode: user.referralCode, isActive: user.isActive, level: user.level } });
}

export async function getDashboard(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { referrals: true }
  });

  const transactions = await prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 });

  res.json({
    balances: {
      depositTotal: user.totalDeposits,
      earnedMoney: user.totalEarnings,
      withdrawable: Math.max(user.totalDeposits + user.totalEarnings - user.totalWithdrawals, 0),
    },
    referrals: user.referrals.map(r => ({ id: r.id, fullName: r.fullName, joinedAt: r.createdAt })),
    transactions,
    notifications,
    level: user.level,
    referralCode: user.referralCode,
    phone: user.phone,
  });
}

export async function getReferrals(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { referrals: true } });
  res.json({ referrals: user.referrals });
}

export async function getNotifications(req, res) {
  const notes = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ notifications: notes });
}

export async function deposit(req, res) {
  try {
    const Body = z.object({ amount: z.number().int().positive() });
    const parsed = Body.safeParse({ amount: Number(req.body.amount) });
    if (!parsed.success) return res.status(400).json({ error: 'Invalid amount' });
    const amount = parsed.data.amount;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Determine activation fee from settings/env (for reactivation)
    let activationFee = 300;
    try {
      const setting = await prisma.setting.findFirst();
      if (setting?.activationFeeKES) activationFee = setting.activationFeeKES;
    } catch {}
    activationFee = Number(process.env.ACTIVATION_FEE_KES || activationFee);

    // If user is inactive, require exact activation fee to reactivate
    if (!user.isActive) {
      if (amount !== activationFee) {
        return res.status(400).json({ error: `Your account is not active. Deposit KES ${activationFee} to reactivate.` });
      }
      const tx = await prisma.transaction.create({ data: { type: 'REACTIVATION', amount, status: 'PENDING', userId: user.id } });
      const payRes = await Payments.initiateSTK({ phone: user.phone, amount, metadata: { txId: tx.id, kind: 'REACTIVATION' } });
      return res.json({ message: 'Reactivation STK push initiated', checkoutRequestID: payRes.checkoutRequestID });
    }

    // Normal deposit path
    const tx = await prisma.transaction.create({ data: { type: 'DEPOSIT', amount, status: 'PENDING', userId: user.id } });
    const payRes = await Payments.initiateSTK({ phone: user.phone, amount, metadata: { txId: tx.id, kind: 'DEPOSIT' } });

    res.json({ message: 'STK push initiated', checkoutRequestID: payRes.checkoutRequestID });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Deposit initiation failed' });
  }
}

export async function withdraw(req, res) {
  try {
    // Friday-only rule
    const withdrawDay = (process.env.WITHDRAW_DAY || 'Friday').toLowerCase();
    const today = dayjs().format('dddd').toLowerCase();
    if (today !== withdrawDay) {
      return res.status(400).json({ error: 'Withdrawals are only available on Fridays.' });
    }

    const Body = z.object({ amount: z.number().int().positive() });
    const parsed = Body.safeParse({ amount: Number(req.body.amount) });
    if (!parsed.success) return res.status(400).json({ error: 'Invalid amount' });
    const amount = parsed.data.amount;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const available = Math.max(user.totalDeposits + user.totalEarnings - user.totalWithdrawals, 0);
    if (amount > available) return res.status(400).json({ error: 'Insufficient balance' });

    // Reactivation rule: if total withdrawals > 2000, require re-activation
    if (!user.isActive) return res.status(400).json({ error: 'Your account is not active. Deposit the activation fee to reactivate.' });

    const tx = await prisma.transaction.create({ data: { type: 'WITHDRAWAL', amount, status: 'PENDING', userId: user.id } });

    // Admin must approve this withdrawal (may trigger M-Pesa B2C payout).
    res.json({ message: 'Withdrawal request received. Await admin approval.', txId: tx.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
}

export async function uploadProfileImage(_req, res) {
  // Placeholder: In production, integrate S3 or cloud storage
  res.json({ message: 'Upload endpoint placeholder' });
}

export async function updateProfile(req, res) {
  const { fullName } = req.body;
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { fullName } });
  res.json({ user });
}
