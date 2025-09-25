import { prisma } from '../db/prisma.js';
import { Payments } from '../services/payments.js';

export async function getAllUsers(_req, res) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ users });
}

export async function getAllTransactions(_req, res) {
  const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ transactions: txs });
}

export async function approveWithdrawal(req, res) {
  try {
    const { id } = req.params;
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    if (tx.type !== 'WITHDRAWAL') return res.status(400).json({ error: 'Not a withdrawal transaction' });
    if (tx.status !== 'PENDING') return res.status(400).json({ error: 'Transaction not pending' });

    const user = await prisma.user.findUnique({ where: { id: tx.userId } });

    const payout = await Payments.payoutB2C({ phone: user.phone, amount: tx.amount, txId: tx.id, remarks: 'User withdrawal' });
    const updated = await prisma.transaction.update({
      where: { id },
      data: { metadata: { ...(tx.metadata || {}), payout } }
    });
    return res.json({ message: 'Payout initiated. Await M-Pesa confirmation.', tx: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Approval failed' });
  }
}

export async function getSettings(_req, res) {
  let setting = await prisma.setting.findFirst();
  if (!setting) setting = await prisma.setting.create({ data: {} });
  res.json({ setting });
}

export async function updateSettings(req, res) {
  const { referralBonusKES, activationFeeKES, withdrawDay } = req.body;
  let setting = await prisma.setting.findFirst();
  if (!setting) setting = await prisma.setting.create({ data: {} });
  setting = await prisma.setting.update({ where: { id: setting.id }, data: { referralBonusKES, activationFeeKES, withdrawDay } });
  res.json({ setting });
}

export async function getAnalytics(_req, res) {
  const users = await prisma.user.count();
  const txCount = await prisma.transaction.count();
  const topEarners = await prisma.user.findMany({ orderBy: { totalEarnings: 'desc' }, take: 10 });
  res.json({ users, txCount, topEarners });
}
