import { prisma } from '../db/prisma.js';

export async function getAllUsers(_req, res) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ users });
}

export async function getAllTransactions(_req, res) {
  const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ transactions: txs });
}

export async function approveWithdrawal(req, res) {
  // Placeholder: an approval flow would exist in real payouts
  const { id } = req.params;
  const tx = await prisma.transaction.update({ where: { id }, data: { status: 'SUCCESS' } });
  res.json({ message: 'Withdrawal approved', tx });
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
