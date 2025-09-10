import pool from '../config/database.js';

class Product {
  // Create a new product
  static async create(productData) {
    const { merchant_id, name, description, price, quantity, category, embedding } = productData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO products (merchant_id, name, description, price, quantity, category, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [merchant_id, name, description, price, quantity, category, JSON.stringify(embedding)]
      );
      
      return { id: result.insertId, ...productData };
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Find product by ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          p.*,
          m.shop_name,
          m.latitude,
          m.longitude
        FROM products p
        JOIN merchants m ON p.merchant_id = m.id
        WHERE p.id = ?`,
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding product: ${error.message}`);
    }
  }

  // Find all products by merchant ID
  static async findByMerchantId(merchantId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE merchant_id = ? ORDER BY name',
        [merchantId]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching merchant products: ${error.message}`);
    }
  }

  // Find all products
  static async findAll(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          p.*,
          m.shop_name
        FROM products p
        JOIN merchants m ON p.merchant_id = m.id
        ORDER BY p.name
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Update product
  static async update(id, productData) {
    const { name, description, price, quantity, category, embedding } = productData;
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      fields.push('price = ?');
      values.push(price);
    }
    if (quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(quantity);
    }
    if (category !== undefined) {
      fields.push('category = ?');
      values.push(category);
    }
    if (embedding !== undefined) {
      fields.push('embedding = ?');
      values.push(JSON.stringify(embedding));
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    try {
      const [result] = await pool.execute(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Search products by vector similarity and location
  static async searchByVectorAndLocation(embedding, lat, lng, distance = 5000, limit = 20) {
    try {
      const [rows] = await pool.execute(
        `SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.quantity,
          p.category,
          m.id as merchant_id,
          m.shop_name,
          m.latitude,
          m.longitude,
          VEC_COSINE_DISTANCE(p.embedding, ?) AS similarity,
          (6371000 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
            COS(RADIANS(?) - RADIANS(m.longitude)) +
            SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
          )) AS distance
        FROM products p
        JOIN merchants m ON p.merchant_id = m.id
        WHERE p.quantity > 0
          AND (6371000 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(m.latitude)) *
            COS(RADIANS(?) - RADIANS(m.longitude)) +
            SIN(RADIANS(?)) * SIN(RADIANS(m.latitude))
          )) <= ?
        ORDER BY similarity ASC
        LIMIT ?`,
        [
          JSON.stringify(embedding),
          lat, lng, lat,
          lat, lng, lat,
          distance,
          limit
        ]
      );
      
      return rows.map(row => ({
        ...row,
        similarity: parseFloat(row.similarity),
        distance: parseFloat(row.distance)
      }));
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get products by category
  static async findByCategory(category, limit = 100, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          p.*,
          m.shop_name,
          m.latitude,
          m.longitude
        FROM products p
        JOIN merchants m ON p.merchant_id = m.id
        WHERE p.category = ? AND p.quantity > 0
        ORDER BY p.name
        LIMIT ? OFFSET ?`,
        [category, limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  // Get low stock products for a merchant
  static async findLowStock(merchantId, threshold = 5) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE merchant_id = ? AND quantity > 0 AND quantity <= ? ORDER BY quantity ASC',
        [merchantId, threshold]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  // Update product quantity
  static async updateQuantity(id, quantity) {
    try {
      const [result] = await pool.execute(
        'UPDATE products SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating product quantity: ${error.message}`);
    }
  }
}

export default Product;