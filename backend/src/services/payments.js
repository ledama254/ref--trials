// M-Pesa Daraja STK push integration (sandbox/production)
import fetch from 'node-fetch';

const ENV = (process.env.MPESA_ENV || 'sandbox').toLowerCase(); // 'sandbox' | 'production'
const BASE_URL = ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

function ensureEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function formatPhone(msisdn) {
  // Converts 07XXXXXXXX, 7XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX to 2547XXXXXXXX
  let p = (msisdn || '').toString().trim();
  if (p.startsWith('+')) p = p.slice(1);
  if (p.startsWith('0')) p = '254' + p.slice(1);
  if (p.startsWith('7')) p = '254' + p;
  // If already starts with 254, keep
  return p;
}

async function getAccessToken() {
  const key = ensureEnv('MPESA_CONSUMER_KEY');
  const secret = ensureEnv('MPESA_CONSUMER_SECRET');
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error('M-Pesa auth failed: no access_token');
  return data.access_token;
}

function nowTimestamp() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${y}${M}${D}${h}${m}${s}`;
}

export const Payments = {
  // metadata: { txId: string, kind: 'ACTIVATION'|'REACTIVATION'|'DEPOSIT' }
  async initiateSTK({ phone, amount, metadata }) {
    const callbackBase = ensureEnv('MPESA_CALLBACK_URL');
    const shortCode = ensureEnv('MPESA_SHORTCODE');
    const passkey = ensureEnv('MPESA_PASSKEY');

    const token = await getAccessToken();

    const timestamp = nowTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
    const PhoneNumber = formatPhone(phone);
    const callbackUrl = `${callbackBase}${callbackBase.includes('?') ? '&' : '?'}txId=${encodeURIComponent(metadata.txId)}&kind=${encodeURIComponent(metadata.kind || '')}`;

    const body = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Number(amount),
      PartyA: PhoneNumber,
      PartyB: shortCode,
      PhoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: String(metadata.txId),
      TransactionDesc: String(metadata.kind || 'REFERRAL')
    };

    const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || data.ResponseCode !== '0') {
      const reason = data.errorMessage || data.errorCode || data.ResponseDescription || `HTTP ${res.status}`;
      throw new Error(`STK push failed: ${reason}`);
    }

    return {
      checkoutRequestID: data.CheckoutRequestID,
      merchantRequestID: data.MerchantRequestID,
    };
  },

  async payoutB2C({ phone, amount, txId, remarks = 'Withdrawal' }) {
    const token = await getAccessToken();
    const PartyA = process.env.MPESA_B2C_SHORTCODE || ensureEnv('MPESA_SHORTCODE');
    const InitiatorName = ensureEnv('MPESA_INITIATOR_NAME');
    const SecurityCredential = ensureEnv('MPESA_SECURITY_CREDENTIAL');
    const baseResultUrl = process.env.MPESA_B2C_CALLBACK_URL || ensureEnv('MPESA_CALLBACK_URL');
    const ResultURL = `${baseResultUrl.replace(/\/$/, '')}${baseResultUrl.includes('?') ? '&' : '?'}txId=${encodeURIComponent(txId)}&kind=B2C`;
    const QueueTimeOutURL = ResultURL; // reuse

    const body = {
      InitiatorName,
      SecurityCredential,
      CommandID: 'BusinessPayment',
      Amount: Number(amount),
      PartyA,
      PartyB: formatPhone(phone),
      Remarks: remarks,
      QueueTimeOutURL,
      ResultURL,
      Occasion: 'REFERRAL'
    };

    const res = await fetch(`${BASE_URL}/mpesa/b2c/v1/paymentrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok || data.ResponseCode !== '0') {
      const reason = data.errorMessage || data.errorCode || data.ResponseDescription || `HTTP ${res.status}`;
      throw new Error(`B2C payout failed: ${reason}`);
    }
    return {
      ConversationID: data.ConversationID,
      OriginatorConversationID: data.OriginatorConversationID,
      ResponseDescription: data.ResponseDescription,
    };
  }
};
