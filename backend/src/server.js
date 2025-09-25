import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

import { app } from './app.js';

// Create and configure server
const server = express();

// Security and logging middleware
server.use(helmet());
server.use(morgan('dev'));
server.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));
server.use(compression());

// CORS: allow multiple frontend origins (comma-separated FRONTEND_URLS) and a fallback FRONTEND_URL.
// Also allow Vercel preview domains by suffix.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const FRONTEND_URLS = (process.env.FRONTEND_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowOrigin = (origin) => {
  if (!origin) return true; // allow non-browser clients
  if (origin === FRONTEND_URL) return true;
  if (FRONTEND_URLS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true; // allow Vercel preview domains
  if (origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000') return true;
  return false;
};
server.use(cors({
  origin: (origin, callback) => {
    if (allowOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsers
server.use(express.json({ limit: '1mb' }));
server.use(express.urlencoded({ extended: true }));

// Mount application
server.use('/api', app);

// Health check
server.get('/health', (_req, res) => res.json({ ok: true }));

// Start listening
// Use platform-provided PORT (Render/Railway) or fallback
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
