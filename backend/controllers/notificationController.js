//controllers/notificationController.js

import NotificationService from '../services/notificationService.js';
import Notification from '../models/Notification.js';

class NotificationController {
  /**
   * Get notifications for the authenticated merchant
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const { page, limit, unread } = req.query;
      
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        unreadOnly: unread === 'true'
      };
      
      const result = await NotificationService.getMerchantNotifications(merchantId, options);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const result = await NotificationService.getMerchantNotifications(merchantId, { 
        limit: 1, 
        unreadOnly: true 
      });
      
      res.json({
        success: true,
        data: {
          unreadCount: result.unreadCount
        }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message
      });
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const { id } = req.params;
      
      const success = await NotificationService.markNotificationAsRead(parseInt(id), merchantId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found or already read'
        });
      }
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const count = await NotificationService.markAllNotificationsAsRead(merchantId);
      
      res.json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  /**
   * Get notification settings for the authenticated merchant
   */
  static async getSettings(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const settings = await NotificationService.getMerchantNotificationSettings(merchantId);
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting notification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification settings',
        error: error.message
      });
    }
  }

  /**
   * Update notification settings for the authenticated merchant
   */
  static async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const settingsData = req.body;
      
      // Validate settings data
      const allowedFields = [
        'low_stock_enabled',
        'low_stock_threshold',
        'critical_stock_threshold',
        'ai_enhanced_notifications',
        'daily_notification_time',
        'email_notifications',
        'email'
      ];
      
      const filteredData = {};
      for (const field of allowedFields) {
        if (settingsData[field] !== undefined) {
          filteredData[field] = settingsData[field];
        }
      }
      
      // Validate thresholds
      if (filteredData.low_stock_threshold !== undefined) {
        const threshold = parseInt(filteredData.low_stock_threshold);
        if (isNaN(threshold) || threshold < 1 || threshold > 100) {
          return res.status(400).json({
            success: false,
            message: 'Low stock threshold must be between 1 and 100'
          });
        }
        filteredData.low_stock_threshold = threshold;
      }
      
      if (filteredData.critical_stock_threshold !== undefined) {
        const threshold = parseInt(filteredData.critical_stock_threshold);
        if (isNaN(threshold) || threshold < 1 || threshold > 50) {
          return res.status(400).json({
            success: false,
            message: 'Critical stock threshold must be between 1 and 50'
          });
        }
        filteredData.critical_stock_threshold = threshold;
      }
      
      // Ensure critical threshold is less than low stock threshold
      if (filteredData.critical_stock_threshold && filteredData.low_stock_threshold) {
        if (filteredData.critical_stock_threshold >= filteredData.low_stock_threshold) {
          return res.status(400).json({
            success: false,
            message: 'Critical stock threshold must be less than low stock threshold'
          });
        }
      }
      
      const updatedSettings = await NotificationService.updateMerchantNotificationSettings(
        merchantId, 
        filteredData
      );
      
      res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: updatedSettings
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification settings',
        error: error.message
      });
    }
  }

  /**
   * Check if it's the merchant's notification time and process if so
   */
  static async checkNotificationTime(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const result = await NotificationService.checkAndProcessMerchantNotificationTime(merchantId);
      
      res.json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error) {
      console.error('Error checking notification time:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check notification time',
        error: error.message
      });
    }
  }

  /**
   * Manually trigger low stock check (for testing purposes)
   */
  static async triggerLowStockCheck(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const notificationsCreated = await NotificationService.triggerLowStockCheckForMerchant(merchantId);
      
      res.json({
        success: true,
        message: `Low stock check completed. Created ${notificationsCreated} notifications.`,
        data: { notificationsCreated }
      });
    } catch (error) {
      console.error('Error triggering low stock check:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger low stock check',
        error: error.message
      });
    }
  }

  /**
   * Get a specific notification by ID
   */
  static async getNotificationById(req, res) {
    try {
      const userId = req.user.id;
      
      // Get merchant ID from user ID
      const merchantId = await NotificationService.getMerchantIdFromUserId(userId);
      
      if (!merchantId) {
        return res.status(404).json({
          success: false,
          message: 'Merchant profile not found. Please complete your merchant setup.'
        });
      }
      
      const { id } = req.params;
      
      const notification = await Notification.findById(parseInt(id), merchantId);
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      
      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error getting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification',
        error: error.message
      });
    }
  }

  /**
   * Admin endpoint to trigger low stock check for all merchants (for cron job)
   */
  static async triggerGlobalLowStockCheck(req, res) {
    try {
      // This should be protected by admin auth middleware
      const notificationsCreated = await NotificationService.processLowStockNotifications();
      
      res.json({
        success: true,
        message: `Global low stock check completed. Created ${notificationsCreated} notifications.`,
        data: { notificationsCreated }
      });
    } catch (error) {
      console.error('Error triggering global low stock check:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger global low stock check',
        error: error.message
      });
    }
  }
}

export default NotificationController;