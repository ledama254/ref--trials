import { prisma } from '../db/prisma.js';

// Public callback used by M-Pesa to confirm STK push results
export async function mpesaCallback(req, res) {
  try {
    // Prefer txId from query string (we add it when initiating STK)
    const txId = req.query?.txId || req.body?.txId;
    const kind = req.query?.kind || req.body?.kind;
    if (!txId) return res.status(400).json({ error: 'Missing txId' });

    // Parse Daraja payload shape
    // STK (C2B): { Body: { stkCallback: { ResultCode, ResultDesc, ... } } }
    // B2C: { Result: { ResultCode, ResultDesc, ... } }
    let resultCode = req.body?.ResultCode ?? req.body?.resultCode;
    let resultDesc = req.body?.ResultDesc ?? req.body?.resultDesc;
    const stk = req.body?.Body?.stkCallback;
    const b2c = req.body?.Result;
    let isB2C = false;
    if (stk) {
      resultCode = stk.ResultCode;
      resultDesc = stk.ResultDesc;
    }
    if (b2c) {
      resultCode = b2c.ResultCode;
      resultDesc = b2c.ResultDesc;
      isB2C = true;
    }

    const success = String(resultCode) === '0';

    // Update transaction status
    await prisma.transaction.update({
      where: { id: txId },
      data: { status: success ? 'SUCCESS' : 'FAILED', metadata: req.body }
    });

    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    const user = await prisma.user.findUnique({ where: { id: tx.userId } });

    if (success) {
      if (!isB2C && (tx.type === 'ACTIVATION' || tx.type === 'REACTIVATION')) {
        await prisma.user.update({ where: { id: user.id }, data: { isActive: true, totalDeposits: { increment: tx.amount } } });

        // If activation and user had referrer, award referrer 100 KES
        if (tx.type === 'ACTIVATION' && user.referrerCode) {
          const referrer = await prisma.user.findUnique({ where: { referralCode: user.referrerCode } });
          if (referrer) {
            // Determine referral bonus from settings/env
            let bonus = 100;
            try {
              const setting = await prisma.setting.findFirst();
              if (setting?.referralBonusKES) bonus = setting.referralBonusKES;
            } catch {}
            bonus = Number(process.env.REFERRAL_BONUS_KES || bonus);

            await prisma.user.update({ where: { id: referrer.id }, data: { totalEarnings: { increment: bonus } } });
            await prisma.notification.create({ data: { userId: referrer.id, message: `Congrats, ${user.fullName} just joined with your code! You earned KES ${bonus}.` } });
          }
        }
      }

      if (!isB2C && tx.type === 'DEPOSIT') {
        await prisma.user.update({ where: { id: user.id }, data: { totalDeposits: { increment: tx.amount } } });
      }

      // B2C success -> finalize withdrawal
      if (isB2C && tx.type === 'WITHDRAWAL') {
        await prisma.user.update({ where: { id: user.id }, data: { totalWithdrawals: { increment: tx.amount } } });
        const updated = await prisma.user.findUnique({ where: { id: user.id } });
        if (updated.totalWithdrawals > 2000) {
          await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
        }
      }
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Callback error' });
  }
}
