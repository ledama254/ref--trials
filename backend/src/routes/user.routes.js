import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getMe, getDashboard, deposit, withdraw, getReferrals, getNotifications, uploadProfileImage, updateProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMe);
router.get('/dashboard', getDashboard);
router.get('/referrals', getReferrals);
router.get('/notifications', getNotifications);

router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

router.post('/profile/upload', uploadProfileImage);
router.post('/profile/update', updateProfile);

export default router;
