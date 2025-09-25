import express from 'express';
import { mpesaCallback } from '../controllers/payments.controller.js';

const router = express.Router();

// Public callback endpoint for M-Pesa STK push result notifications
router.post('/mpesa/callback', mpesaCallback);

export default router;
