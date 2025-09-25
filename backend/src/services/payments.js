// Payments abstraction. In dev we use a mock that immediately calls back success.
// In prod, integrate M-Pesa Daraja STK push here.
import fetch from 'node-fetch';

const PROVIDER = process.env.PAYMENTS_PROVIDER || 'mock';
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'http://localhost:4000/payments/mpesa/callback';

export const Payments = {
  async initiateSTK({ phone, amount, metadata }) {
    if (PROVIDER === 'mock') {
      // Simulate an async STK request then callback
      const checkoutRequestID = 'MOCK-' + Math.random().toString(36).slice(2, 10).toUpperCase();
      setTimeout(async () => {
        try {
          await fetch(CALLBACK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ txId: metadata.txId, resultCode: '0', resultDesc: 'Success', kind: metadata.kind })
          });
        } catch (e) {
          console.error('Mock callback failed', e);
        }
      }, 1200);
      return { checkoutRequestID };
    }

    // TODO: Implement real Daraja integration
    throw new Error('M-Pesa provider not implemented yet. Set PAYMENTS_PROVIDER=mock for dev.');
  }
};
