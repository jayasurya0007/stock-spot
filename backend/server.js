import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import searchRoutes from './routes/search.js';
import merchantRoutes from './routes/merchant.js';
import productRoutes from './routes/product.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/search', searchRoutes);
app.use('/merchant', merchantRoutes);
app.use('/product', productRoutes);
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`StockSpot server running on http://localhost:${PORT}`);
});