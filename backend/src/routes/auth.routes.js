import express from 'express';
import { register, login, activateAccount } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Registration and login
router.post('/register', register);
router.post('/login', login);

// Activation (requires authentication, triggers STK push for 300 KES)
router.post('/activate', requireAuth, activateAccount);

export default router;
