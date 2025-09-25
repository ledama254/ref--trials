import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { Payments } from '../services/payments.js';

const prisma = new PrismaClient();

// Helper to create JWT
function signToken(user) {
  const payload = { id: user.id, phone: user.phone, role: user.phone === 'admin' ? 'admin' : 'user' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { fullName, phone, password, referralCode } = req.body;

    if (!fullName || !phone || !password) return res.status(400).json({ error: 'Missing fields' });

    // Prevent self-referral via phone match to referrer
    let referrer = null;
    if (referralCode) {
      referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) return res.status(400).json({ error: 'Invalid referral code' });
      if (referrer.phone === phone) return res.status(400).json({ error: 'Self-referral is not allowed' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique 8-digit code
    let myCode;
    while (true) {
      myCode = ('' + Math.floor(10000000 + Math.random() * 90000000));
      const exists = await prisma.user.findUnique({ where: { referralCode: myCode } });
      if (!exists) break;
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        passwordHash,
        referralCode: myCode,
        referrerCode: referralCode || null,
      },
    });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, fullName: user.fullName, phone: user.phone, referralCode: user.referralCode, isActive: user.isActive } });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'Phone already registered' });
    return res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, fullName: user.fullName, phone: user.phone, referralCode: user.referralCode, isActive: user.isActive } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

// POST /api/auth/activate
export async function activateAccount(req, res) {
  try {
    const userId = req.user.id;
    const { referralCode } = req.body || {};
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isActive) return res.status(400).json({ error: 'Account already active' });

    // If referralCode provided during activation and not already set, validate and set it
    if (referralCode && !user.referrerCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (!referrer) return res.status(400).json({ error: 'Invalid referral code' });
      if (referrer.phone === user.phone) return res.status(400).json({ error: 'Self-referral is not allowed' });
      user = await prisma.user.update({ where: { id: user.id }, data: { referrerCode: referralCode } });
    }

    // Create activation transaction and trigger STK (mock in dev)
    // Prefer Setting table, fallback to env, then 300
    let activationFee = 300;
    try {
      const setting = await prisma.setting.findFirst();
      if (setting?.activationFeeKES) activationFee = setting.activationFeeKES;
    } catch {}
    activationFee = Number(process.env.ACTIVATION_FEE_KES || activationFee);
    const tx = await prisma.transaction.create({
      data: {
        type: 'ACTIVATION',
        amount: activationFee,
        status: 'PENDING',
        userId: user.id,
      }
    });

    // Trigger payment
    const payRes = await Payments.initiateSTK({
      phone: user.phone,
      amount: activationFee,
      metadata: { txId: tx.id, kind: 'ACTIVATION' },
    });

    return res.json({ message: 'STK push initiated. Enter your M-Pesa PIN to activate.', checkoutRequestID: payRes.checkoutRequestID });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Activation failed' });
  }
}
