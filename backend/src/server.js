import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { app } from './app.js';

// Create and configure server
const server = express();

// Security and logging middleware
server.use(helmet());
server.use(morgan('dev'));

// CORS: allow frontend origin
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
server.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Body parsers
server.use(express.json({ limit: '1mb' }));
server.use(express.urlencoded({ extended: true }));

// Mount application
server.use('/api', app);

// Health check
server.get('/health', (_req, res) => res.json({ ok: true }));

// Start listening
const PORT = Number(process.env.BACKEND_PORT || 4000);
server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
