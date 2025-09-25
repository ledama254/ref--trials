import express from 'express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import adminRoutes from './routes/admin.routes.js';

export const app = express.Router();

// Route groups
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);

// 404 for /api/*
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err?.name === 'ZodError') {
    return res.status(400).json({ error: err.issues?.[0]?.message || 'Invalid input' });
  }
  res.status(500).json({ error: 'Internal server error' });
});
