//routes/notification.js

import express from 'express';
import NotificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Unprotected test endpoint for system verification
router.get('/system/status', (req, res) => {
  res.json({
    success: true,
    message: 'Notification system is running',
    timestamp: new Date().toISOString(),
    features: {
      aiEnhancement: true,
      dailyScheduler: true,
      realTimeNotifications: true
    }
  });
});

// All notification routes require authentication
router.use(authenticateToken);

// Get notifications for the authenticated merchant
router.get('/', NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Get a specific notification by ID
router.get('/:id', NotificationController.getNotificationById);

// Mark a notification as read
router.patch('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// Get notification settings
router.get('/settings/current', NotificationController.getSettings);

// Update notification settings
router.put('/settings', NotificationController.updateSettings);

// Check if it's the merchant's notification time and process accordingly
router.post('/check-time', NotificationController.checkNotificationTime);

// Manually trigger low stock check for this merchant (for testing)
router.post('/trigger-check', NotificationController.triggerLowStockCheck);

// Admin route for global low stock check (should be protected by admin middleware)
router.post('/admin/trigger-global-check', NotificationController.triggerGlobalLowStockCheck);

export default router;