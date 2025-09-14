//models/Notification.js

import pool from '../config/database.js';

class Notification {
  // Create a new notification
  static async create(notificationData) {
    const { 
      merchant_id, 
      type = 'low_stock', 
      title, 
      message, 
      product_id = null,
      is_ai_enhanced = false,
      original_message = null,
      metadata = null
    } = notificationData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO notifications 
         (merchant_id, type, title, message, product_id, is_ai_enhanced, original_message, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          merchant_id, 
          type, 
          title, 
          message, 
          product_id, 
          is_ai_enhanced,
          original_message,
          metadata ? JSON.stringify(metadata) : null
        ]
      );
      
      return { id: result.insertId, ...notificationData, created_at: new Date() };
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Get notifications for a merchant
  static async findByMerchantId(merchantId, options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;
    
    try {
      // Ensure limit and offset are integers
      const limitInt = parseInt(limit) || 50;
      const offsetInt = parseInt(offset) || 0;
      
      let query = `
        SELECT 
          n.*,
          p.name as product_name,
          p.quantity as current_quantity
        FROM notifications n
        LEFT JOIN products p ON n.product_id = p.id
        WHERE n.merchant_id = ?
      `;
      
      const params = [merchantId];
      
      if (unreadOnly) {
        query += ' AND n.is_read = FALSE';
      }
      
      query += ` ORDER BY n.created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;
      
      const [rows] = await pool.execute(query, params);
      
      // Parse metadata JSON safely
      return rows.map(row => {
        let parsedMetadata = null;
        if (row.metadata) {
          try {
            parsedMetadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
          } catch (parseError) {
            console.warn(`Failed to parse metadata for notification ${row.id}:`, parseError.message);
            parsedMetadata = null;
          }
        }
        return {
          ...row,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  // Mark notification as read
  static async markAsRead(id, merchantId = null) {
    try {
      let query = 'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?';
      const params = [id];
      
      // Ensure merchant can only mark their own notifications as read
      if (merchantId) {
        query += ' AND merchant_id = ?';
        params.push(merchantId);
      }
      
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read for a merchant
  static async markAllAsRead(merchantId) {
    try {
      const [result] = await pool.execute(
        'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE merchant_id = ? AND is_read = FALSE',
        [merchantId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // Get unread count for a merchant
  static async getUnreadCount(merchantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE merchant_id = ? AND is_read = FALSE',
        [merchantId]
      );
      return rows[0].count;
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  // Delete old notifications (cleanup)
  static async deleteOldNotifications(daysOld = 30) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
        [daysOld]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Error deleting old notifications: ${error.message}`);
    }
  }

  // Get notification by ID
  static async findById(id, merchantId = null) {
    try {
      let query = `
        SELECT 
          n.*,
          p.name as product_name,
          p.quantity as current_quantity
        FROM notifications n
        LEFT JOIN products p ON n.product_id = p.id
        WHERE n.id = ?
      `;
      const params = [id];
      
      if (merchantId) {
        query += ' AND n.merchant_id = ?';
        params.push(merchantId);
      }
      
      const [rows] = await pool.execute(query, params);
      
      if (rows.length === 0) return null;
      
      const notification = rows[0];
      return {
        ...notification,
        metadata: notification.metadata ? JSON.parse(notification.metadata) : null
      };
    } catch (error) {
      throw new Error(`Error finding notification: ${error.message}`);
    }
  }
}

export default Notification;