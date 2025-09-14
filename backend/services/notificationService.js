//services/notificationService.js

import Product from '../models/Product.js';
import Merchant from '../models/Merchant.js';
import Notification from '../models/Notification.js';
import NotificationSettings from '../models/NotificationSettings.js';
import { enhanceNotificationMessage } from '../utils/notificationEnhancer.js';

class NotificationService {
  /**
   * Check and create low stock notifications for all merchants
   * This is the main function called by the daily scheduler
   */
  static async processLowStockNotifications() {
    console.log('🔄 Starting low stock notification process...');
    
    try {
      // Get all merchants with notifications enabled
      const merchants = await NotificationSettings.getMerchantsWithNotificationsEnabled();
      console.log(`📊 Found ${merchants.length} merchants with notifications enabled`);
      
      let totalNotificationsCreated = 0;
      
      for (const merchant of merchants) {
        try {
          // Check if notification was already sent today
          const alreadySent = await NotificationSettings.wasNotificationSentToday(merchant.merchant_id);
          
          if (alreadySent) {
            console.log(`⏭️  Skipping ${merchant.shop_name} - notification already sent today`);
            continue;
          }
          
          // Process low stock notifications for this merchant
          const notificationsCreated = await this.processLowStockForMerchant(merchant);
          totalNotificationsCreated += notificationsCreated;
          
        } catch (error) {
          console.error(`❌ Error processing notifications for merchant ${merchant.shop_name}:`, error);
          // Continue with other merchants even if one fails
        }
      }
      
      console.log(`✅ Low stock notification process completed. Created ${totalNotificationsCreated} notifications.`);
      return totalNotificationsCreated;
      
    } catch (error) {
      console.error('❌ Error in processLowStockNotifications:', error);
      throw error;
    }
  }

  /**
   * Process low stock notifications for a specific merchant
   * @param {Object} merchant - Merchant data with notification settings
   * @returns {number} Number of notifications created
   */
  static async processLowStockForMerchant(merchant) {
    const { merchant_id, shop_name, low_stock_threshold, critical_stock_threshold, ai_enhanced_notifications } = merchant;
    
    try {
      // Get low stock products for this merchant
      const lowStockProducts = await Product.findLowStock(merchant_id, low_stock_threshold);
      
      if (lowStockProducts.length === 0) {
        console.log(`✅ No low stock products for ${shop_name}`);
        return 0;
      }
      
      console.log(`📦 Found ${lowStockProducts.length} low stock products for ${shop_name}`);
      
      // Separate critical and low stock products
      const criticalProducts = lowStockProducts.filter(p => p.quantity <= critical_stock_threshold);
      const regularLowStock = lowStockProducts.filter(p => p.quantity > critical_stock_threshold);
      
      let notificationsCreated = 0;
      const productIds = lowStockProducts.map(p => p.id);
      
      // Create critical stock notifications (individual notifications for critical items)
      if (criticalProducts.length > 0) {
        for (const product of criticalProducts) {
          const notification = await this.createLowStockNotification({
            merchantId: merchant_id,
            shopName: shop_name,
            products: [product],
            type: 'critical',
            threshold: critical_stock_threshold,
            aiEnhanced: ai_enhanced_notifications
          });
          
          if (notification) notificationsCreated++;
        }
      }
      
      // Create regular low stock notification (grouped notification for regular low stock)
      if (regularLowStock.length > 0) {
        const notification = await this.createLowStockNotification({
          merchantId: merchant_id,
          shopName: shop_name,
          products: regularLowStock,
          type: 'low_stock',
          threshold: low_stock_threshold,
          aiEnhanced: ai_enhanced_notifications
        });
        
        if (notification) notificationsCreated++;
      }
      
      // Log that notifications were sent today
      await NotificationSettings.logNotificationSent(merchant_id, productIds);
      
      console.log(`📨 Created ${notificationsCreated} notifications for ${shop_name}`);
      return notificationsCreated;
      
    } catch (error) {
      console.error(`Error processing low stock for merchant ${shop_name}:`, error);
      throw error;
    }
  }

  /**
   * Create a low stock notification with optional AI enhancement
   * @param {Object} notificationData - Data for creating the notification
   * @returns {Object|null} Created notification or null if failed
   */
  static async createLowStockNotification(notificationData) {
    const { merchantId, shopName, products, type, threshold, aiEnhanced } = notificationData;
    
    try {
      // Generate detailed notification data with product names and quantities
      const productCount = products.length;
      const isCritical = type === 'critical';
      
      // Create detailed product information
      const productDetails = products.map(p => {
        const stockLevel = p.quantity <= 1 ? '🔴 CRITICAL' : p.quantity <= 2 ? '🟠 URGENT' : '🟡 LOW';
        return `${p.name} (${p.quantity} left) ${stockLevel}`;
      });
      
      // Generate titles with product names
      let basicTitle = '';
      if (isCritical) {
        basicTitle = productCount === 1 ? 
          `🚨 Critical Stock: ${products[0].name}` :
          `🚨 Critical Stock Alert (${productCount} items)`;
      } else {
        basicTitle = productCount === 1 ? 
          `⚠️ Low Stock: ${products[0].name}` :
          `⚠️ Low Stock Alert (${productCount} items)`;
      }
      
      // Generate detailed messages with quantities
      let basicMessage = '';
      if (productCount === 1) {
        const product = products[0];
        const urgencyText = product.quantity <= 1 ? 
          'CRITICAL - Immediate restocking required!' :
          product.quantity <= 2 ?
          'URGENT - Restock soon to avoid stockout' :
          'Consider restocking to maintain inventory levels';
          
        basicMessage = `📦 ${product.name}: Only ${product.quantity} unit${product.quantity !== 1 ? 's' : ''} remaining. ${urgencyText}`;
      } else {
        // Multiple products
        const criticalCount = products.filter(p => p.quantity <= 1).length;
        const urgentCount = products.filter(p => p.quantity <= 2 && p.quantity > 1).length;
        
        basicMessage = `📊 ${productCount} products need attention:\n\n`;
        
        // Add each product with its status
        products.forEach((product, index) => {
          const status = product.quantity <= 1 ? '🔴' : product.quantity <= 2 ? '🟠' : '🟡';
          basicMessage += `${status} ${product.name}: ${product.quantity} left\n`;
        });
        
        // Add summary
        if (criticalCount > 0) {
          basicMessage += `\n🚨 ${criticalCount} item${criticalCount > 1 ? 's' : ''} critically low - Immediate action needed!`;
        }
        if (urgentCount > 0) {
          basicMessage += `\n⚠️ ${urgentCount} item${urgentCount > 1 ? 's' : ''} need${urgentCount === 1 ? 's' : ''} restocking soon`;
        }
      }
      
      let finalTitle = basicTitle;
      let finalMessage = basicMessage;
      let isAiEnhanced = false;
      let originalMessage = basicMessage;
      
      // Enhance with AI if enabled
      if (aiEnhanced) {
        try {
          const enhancedData = await enhanceNotificationMessage({
            type: 'low_stock',
            products,
            merchantName: shopName,
            originalMessage: basicMessage,
            threshold
          });
          
          if (enhancedData.isEnhanced) {
            finalTitle = enhancedData.title;
            finalMessage = enhancedData.message;
            isAiEnhanced = true;
            originalMessage = enhancedData.originalMessage || basicMessage;
          }
        } catch (aiError) {
          console.warn('AI enhancement failed, using basic notification:', aiError.message);
        }
      }
      
      // Create the notification
      const notificationData = {
        merchant_id: merchantId,
        type: 'low_stock',
        title: finalTitle,
        message: finalMessage,
        product_id: products.length === 1 ? products[0].id : null, // Only set if single product
        is_ai_enhanced: isAiEnhanced,
        original_message: originalMessage,
        metadata: {
          product_count: productCount,
          is_critical: isCritical,
          threshold: threshold,
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            price: p.price
          }))
        }
      };
      
      const notification = await Notification.create(notificationData);
      console.log(`✅ Created notification: ${finalTitle}`);
      
      return notification;
      
    } catch (error) {
      console.error('Error creating low stock notification:', error);
      return null;
    }
  }

  /**
   * Get notifications for a merchant with pagination
   * @param {number} merchantId - Merchant ID
   * @param {Object} options - Query options
   * @returns {Object} Notifications with pagination info
   */
  static async getMerchantNotifications(merchantId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const offset = (page - 1) * limit;
      
      const notifications = await Notification.findByMerchantId(merchantId, {
        limit,
        offset,
        unreadOnly
      });
      
      const unreadCount = await Notification.getUnreadCount(merchantId);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          hasMore: notifications.length === limit
        },
        unreadCount
      };
    } catch (error) {
      throw new Error(`Error fetching merchant notifications: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} merchantId - Merchant ID (for security)
   * @returns {boolean} Success status
   */
  static async markNotificationAsRead(notificationId, merchantId) {
    try {
      return await Notification.markAsRead(notificationId, merchantId);
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read for a merchant
   * @param {number} merchantId - Merchant ID
   * @returns {number} Number of notifications marked as read
   */
  static async markAllNotificationsAsRead(merchantId) {
    try {
      return await Notification.markAllAsRead(merchantId);
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  /**
   * Get or create notification settings for a merchant
   * @param {number} merchantId - Merchant ID
   * @returns {Object} Notification settings
   */
  static async getMerchantNotificationSettings(merchantId) {
    try {
      return await NotificationSettings.findByMerchantId(merchantId);
    } catch (error) {
      throw new Error(`Error fetching notification settings: ${error.message}`);
    }
  }

  /**
   * Update notification settings for a merchant
   * @param {number} merchantId - Merchant ID
   * @param {Object} settingsData - Settings to update
   * @returns {Object} Updated settings
   */
  static async updateMerchantNotificationSettings(merchantId, settingsData) {
    try {
      return await NotificationSettings.update(merchantId, settingsData);
    } catch (error) {
      throw new Error(`Error updating notification settings: ${error.message}`);
    }
  }

  /**
   * Check if it's the merchant's notification time and process if so
   * @param {number} merchantId - Merchant ID
   * @returns {Object} Result with notification status
   */
  static async checkAndProcessMerchantNotificationTime(merchantId) {
    try {
      const settings = await NotificationSettings.findByMerchantId(merchantId);
      
      if (!settings.low_stock_enabled) {
        return {
          isNotificationTime: false,
          message: 'Low stock notifications are disabled',
          notificationsCreated: 0
        };
      }
      
      // Get current time
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Get merchant's notification time
      const notificationTime = settings.daily_notification_time || '09:00:00';
      const [targetHour, targetMinute] = notificationTime.substring(0, 5).split(':').map(Number);
      const targetMinutes = targetHour * 60 + targetMinute;
      
      // Check if it's within 2 minutes of notification time
      const timeDifference = Math.abs(currentMinutes - targetMinutes);
      const isNotificationTime = timeDifference <= 2;
      
      if (!isNotificationTime) {
        const nextNotificationTime = new Date();
        nextNotificationTime.setHours(targetHour, targetMinute, 0, 0);
        if (nextNotificationTime <= now) {
          nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
        }
        
        return {
          isNotificationTime: false,
          message: `Not notification time yet. Next notification at ${nextNotificationTime.toLocaleTimeString()}`,
          notificationsCreated: 0,
          currentTime: now.toLocaleTimeString(),
          scheduledTime: `${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`,
          timeDifference: `${timeDifference} minutes`
        };
      }
      
      // It's notification time - check if already processed today
      const hasBeenProcessedToday = await NotificationSettings.hasBeenProcessedToday(merchantId);
      
      if (hasBeenProcessedToday) {
        return {
          isNotificationTime: true,
          message: 'Notifications already sent today',
          notificationsCreated: 0,
          alreadyProcessed: true
        };
      }
      
      // Process notifications
      const merchantData = await Merchant.findById(merchantId);
      const merchantWithSettings = {
        ...settings,
        merchant_id: merchantId,
        shop_name: merchantData.shop_name
      };
      
      const notificationsCreated = await this.processLowStockForMerchant(merchantWithSettings);
      
      return {
        isNotificationTime: true,
        message: `Notification time! Created ${notificationsCreated} notifications`,
        notificationsCreated,
        processedAt: now.toLocaleTimeString()
      };
      
    } catch (error) {
      throw new Error(`Error checking notification time: ${error.message}`);
    }
  }

  /**
   * Manually trigger low stock check for a specific merchant (for testing)
   * @param {number} merchantId - Merchant ID
   * @returns {number} Number of notifications created
   */
  static async triggerLowStockCheckForMerchant(merchantId) {
    try {
      const merchant = await NotificationSettings.findByMerchantId(merchantId);
      if (!merchant.low_stock_enabled) {
        throw new Error('Low stock notifications are disabled for this merchant');
      }
      
      // Add shop name from merchant data
      const merchantData = await Merchant.findById(merchantId);
      merchant.shop_name = merchantData.shop_name;
      
      return await this.processLowStockForMerchant(merchant);
    } catch (error) {
      throw new Error(`Error triggering low stock check: ${error.message}`);
    }
  }
}

export default NotificationService;