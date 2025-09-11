//models/Merchant.js

import pool from '../config/database.js';

class Merchant {
  // Create a new merchant
  static async create(merchantData) {
    const { shop_name, address, latitude, longitude, owner_name, phone } = merchantData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO merchants (shop_name, address, latitude, longitude, owner_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [shop_name, address, latitude, longitude, owner_name, phone]
      );
      
      return { id: result.insertId, ...merchantData };
    } catch (error) {
      throw new Error(`Error creating merchant: ${error.message}`);
    }
  }

  // Find merchant by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM merchants WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding merchant: ${error.message}`);
    }
  }

  // Find all merchants
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM merchants ORDER BY shop_name'
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching merchants: ${error.message}`);
    }
  }

  // Update merchant
  static async update(id, merchantData) {
    const { shop_name, address, latitude, longitude, owner_name, phone } = merchantData;
    const fields = [];
    const values = [];

    if (shop_name !== undefined) {
      fields.push('shop_name = ?');
      values.push(shop_name);
    }
    if (address !== undefined) {
      fields.push('address = ?');
      values.push(address);
    }
    if (latitude !== undefined) {
      fields.push('latitude = ?');
      values.push(latitude);
    }
    if (longitude !== undefined) {
      fields.push('longitude = ?');
      values.push(longitude);
    }
    if (owner_name !== undefined) {
      fields.push('owner_name = ?');
      values.push(owner_name);
    }
    if (phone !== undefined) {
      fields.push('phone = ?');
      values.push(phone);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE merchants SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating merchant: ${error.message}`);
    }
  }

  // Delete merchant
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM merchants WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting merchant: ${error.message}`);
    }
  }

  // Find merchants near a location
  static async findNearby(lat, lng, distance = 5000) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          id,
          shop_name,
          address,
          latitude,
          longitude,
          owner_name,
          phone,
          (6371000 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(latitude)) *
            COS(RADIANS(?) - RADIANS(longitude)) +
            SIN(RADIANS(?)) * SIN(RADIANS(latitude))
          )) AS distance
        FROM merchants
        HAVING distance <= ?
        ORDER BY distance ASC`,
        [lat, lng, lat, distance]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding nearby merchants: ${error.message}`);
    }
  }

  // Get merchant with product count
  static async getWithProductCount(merchantId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          m.*,
          COUNT(p.id) as product_count,
          SUM(p.quantity) as total_inventory
        FROM merchants m
        LEFT JOIN products p ON m.id = p.merchant_id
        WHERE m.id = ?
        GROUP BY m.id`,
        [merchantId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error getting merchant with product count: ${error.message}`);
    }
  }
}

export default Merchant;