//routes/merchant.js

import express from 'express';
import { addMerchant, getMerchantProducts, getMerchants } from '../controllers/merchantController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, authorizeRoles('admin', 'merchant'), addMerchant);
router.get('/', getMerchants);
router.get('/:merchant_id/products', getMerchantProducts);

export default router;