import { prisma } from '../db/prisma.js';

// Public callback used by M-Pesa (or mock) to confirm STK push results
export async function mpesaCallback(req, res) {
  try {
    const { txId, resultCode, resultDesc, kind } = req.body || {};

    if (!txId) return res.status(400).json({ error: 'Missing txId' });

    const success = String(resultCode) === '0';

    // Update transaction status
    await prisma.transaction.update({
      where: { id: txId },
      data: { status: success ? 'SUCCESS' : 'FAILED', metadata: req.body }
    });

    const tx = await prisma.transaction.findUnique({ where: { id: txId } });
    const user = await prisma.user.findUnique({ where: { id: tx.userId } });

    if (success) {
      if (tx.type === 'ACTIVATION' || tx.type === 'REACTIVATION') {
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

      if (tx.type === 'DEPOSIT') {
        await prisma.user.update({ where: { id: user.id }, data: { totalDeposits: { increment: tx.amount } } });
      }
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Callback error' });
  }
}
