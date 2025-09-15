//server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import searchRoutes from './routes/search.js';
import merchantRoutes from './routes/merchant.js';
import productRoutes from './routes/product.js';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notification.js';
import notificationScheduler from './utils/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting - Increased limits for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for testing)
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/merchant', merchantRoutes);
app.use('/product', productRoutes);
app.use('/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  //console.log(`Server running on port ${PORT}`);
  
  // Start the notification scheduler
  notificationScheduler.start();
});