//routes/product.js

import express from 'express';
import { addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', authenticateToken, authorizeRoles('merchant', 'admin'), addProduct);
router.put('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), updateProduct);
router.delete('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), deleteProduct);

export default router;