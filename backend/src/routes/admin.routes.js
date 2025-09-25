import express from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { getAllUsers, getAllTransactions, approveWithdrawal, getSettings, updateSettings, getAnalytics } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/users', getAllUsers);
router.get('/transactions', getAllTransactions);
router.post('/withdrawals/:id/approve', approveWithdrawal);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);

router.get('/analytics', getAnalytics);

export default router;
