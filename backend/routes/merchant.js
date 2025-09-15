//routes/merchant.js

import express from 'express';
import { addMerchant, getMerchantProducts, getMerchants, getMyMerchantDetails, updateMerchantDetails, getAddressFromCoords } from '../controllers/merchantController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, authorizeRoles('admin', 'merchant'), addMerchant);
router.get('/', getMerchants);
router.get('/my-details', authenticateToken, authorizeRoles('merchant', 'admin'), getMyMerchantDetails);
router.put('/my-details', authenticateToken, authorizeRoles('merchant', 'admin'), updateMerchantDetails);
router.get('/:merchant_id/products', getMerchantProducts);
router.get('/address-from-coords', getAddressFromCoords);

export default router;