// Simple API client for the frontend. Stores JWT token in localStorage.
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
  return res.json();
}

export const Auth = {
  async register(data: { fullName: string; phone: string; password: string; referralCode?: string }) {
    const res = await api('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    localStorage.setItem('token', res.token);
    return res;
  },
  async login(data: { phone: string; password: string }) {
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    localStorage.setItem('token', res.token);
    return res;
  },
  async activate(referralCode?: string) {
    return api('/auth/activate', { method: 'POST', body: JSON.stringify({ referralCode }) });
  },
  logout() {
    localStorage.removeItem('token');
  }
};

export const User = {
  me: () => api('/users/me'),
  dashboard: () => api('/users/dashboard'),
  deposit: (amount: number) => api('/users/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),
  withdraw: (amount: number) => api('/users/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }),
};
