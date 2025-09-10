import express from 'express';
import { addMerchant, getMerchantProducts } from '../controllers/merchantController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, authorizeRoles('admin', 'merchant'), addMerchant);
router.get('/:merchant_id/products', getMerchantProducts);

export default router;