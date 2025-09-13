//routes/product.js

import express from 'express';
import { addProduct, updateProduct, deleteProduct, getMyProducts, getProduct } from '../controllers/productsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-products', authenticateToken, authorizeRoles('merchant', 'admin'), getMyProducts);
router.get('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), getProduct);
router.post('/add', authenticateToken, authorizeRoles('merchant', 'admin'), addProduct);
router.put('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), updateProduct);
router.delete('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), deleteProduct);

export default router;