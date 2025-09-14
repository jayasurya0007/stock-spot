//models/NotificationSettings.js

import pool from '../config/database.js';

class NotificationSettings {
  // Get notification setti  // Check if notification was sent today
  static async wasNotificationSentToday(merchantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM notification_logs WHERE merchant_id = ? AND notification_date = CURDATE()',
        [merchantId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking notification log: ${error.message}`);
    }
  }

  // Alias for consistency
  static async hasBeenProcessedToday(merchantId) {
    return await this.wasNotificationSentToday(merchantId);
  }chant
  static async findByMerchantId(merchantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM notification_settings WHERE merchant_id = ?',
        [merchantId]
      );
      
      if (rows.length === 0) {
        // Create default settings if they don't exist
        return await this.createDefault(merchantId);
      }
      
      return rows[0];
    } catch (error) {
      throw new Error(`Error fetching notification settings: ${error.message}`);
    }
  }

  // Create default notification settings for a merchant
  static async createDefault(merchantId) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO notification_settings 
         (merchant_id, low_stock_enabled, low_stock_threshold, critical_stock_threshold, ai_enhanced_notifications) 
         VALUES (?, TRUE, 5, 2, TRUE)`,
        [merchantId]
      );
      
      return {
        id: result.insertId,
        merchant_id: merchantId,
        low_stock_enabled: true,
        low_stock_threshold: 5,
        critical_stock_threshold: 2,
        ai_enhanced_notifications: true,
        daily_notification_time: '09:00:00',
        email_notifications: false,
        email: null
      };
    } catch (error) {
      throw new Error(`Error creating default notification settings: ${error.message}`);
    }
  }

  // Update notification settings
  static async update(merchantId, settingsData) {
    const {
      low_stock_enabled,
      low_stock_threshold,
      critical_stock_threshold,
      ai_enhanced_notifications,
      daily_notification_time,
      email_notifications,
      email
    } = settingsData;

    try {
      // Ensure settings exist first
      await this.findByMerchantId(merchantId);

      const fields = [];
      const values = [];

      if (low_stock_enabled !== undefined) {
        fields.push('low_stock_enabled = ?');
        values.push(low_stock_enabled);
      }
      if (low_stock_threshold !== undefined) {
        fields.push('low_stock_threshold = ?');
        values.push(low_stock_threshold);
      }
      if (critical_stock_threshold !== undefined) {
        fields.push('critical_stock_threshold = ?');
        values.push(critical_stock_threshold);
      }
      if (ai_enhanced_notifications !== undefined) {
        fields.push('ai_enhanced_notifications = ?');
        values.push(ai_enhanced_notifications);
      }
      if (daily_notification_time !== undefined) {
        fields.push('daily_notification_time = ?');
        values.push(daily_notification_time);
      }
      if (email_notifications !== undefined) {
        fields.push('email_notifications = ?');
        values.push(email_notifications);
      }
      if (email !== undefined) {
        fields.push('email = ?');
        values.push(email);
      }

      if (fields.length === 0) {
        throw new Error('No valid fields provided for update');
      }

      values.push(merchantId);

      const [result] = await pool.execute(
        `UPDATE notification_settings SET ${fields.join(', ')}, updated_at = NOW() WHERE merchant_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('No settings found to update');
      }

      return await this.findByMerchantId(merchantId);
    } catch (error) {
      throw new Error(`Error updating notification settings: ${error.message}`);
    }
  }

  // Get all merchants with low stock notifications enabled
  static async getMerchantsWithNotificationsEnabled() {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          ns.*,
          m.shop_name,
          m.owner_name
        FROM notification_settings ns
        JOIN merchants m ON ns.merchant_id = m.id
        WHERE ns.low_stock_enabled = TRUE`
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching merchants with notifications enabled: ${error.message}`);
    }
  }

  // Check if notification was already sent today
  static async wasNotificationSentToday(merchantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM notification_logs WHERE merchant_id = ? AND notification_date = CURDATE()',
        [merchantId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking notification log: ${error.message}`);
    }
  }

  // Log that notification was sent today
  static async logNotificationSent(merchantId, productIds = []) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO notification_logs (merchant_id, notification_date, low_stock_notifications_sent, product_ids)
         VALUES (?, CURDATE(), ?, ?)
         ON DUPLICATE KEY UPDATE 
         low_stock_notifications_sent = low_stock_notifications_sent + 1,
         product_ids = ?`,
        [merchantId, 1, JSON.stringify(productIds), JSON.stringify(productIds)]
      );
      
      return result.insertId || result.affectedRows;
    } catch (error) {
      throw new Error(`Error logging notification: ${error.message}`);
    }
  }
}

export default NotificationSettings;