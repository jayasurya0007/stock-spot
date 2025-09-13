//routes/product.js

import express from 'express';
import { addProduct, updateProduct, deleteProduct, getMyProducts } from '../controllers/productsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-products', authenticateToken, authorizeRoles('merchant', 'admin'), getMyProducts);
router.post('/add', authenticateToken, authorizeRoles('merchant', 'admin'), addProduct);
router.put('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), updateProduct);
router.delete('/:product_id', authenticateToken, authorizeRoles('merchant', 'admin'), deleteProduct);

// Debug route to check merchant status
router.get('/debug-merchant', authenticateToken, authorizeRoles('merchant', 'admin'), async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [merchants] = await conn.execute('SELECT * FROM merchants WHERE user_id = ?', [req.user.id]);
    conn.release();
    
    res.json({
      user: req.user,
      merchant: merchants[0] || null,
      hasMerchant: merchants.length > 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Debug failed', details: err.message });
  }
});

export default router;