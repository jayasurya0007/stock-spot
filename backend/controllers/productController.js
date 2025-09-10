import { getEmbedding } from '../utils/embeddings.js';
import pool from '../config/database.js';

export const addProduct = async (req, res) => {
  const { merchant_id, name, price, quantity, description, category } = req.body;

  if (!merchant_id || !name || !price || quantity === undefined) {
    return res.status(400).json({ error: 'Merchant ID, name, price, and quantity are required' });
  }

  try {
    const embedding = getEmbedding(name + " " + (description || ""));
    
    const conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO products (merchant_id, name, price, quantity, description, category, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [merchant_id, name, price, quantity, description || null, category || null, JSON.stringify(embedding)]
    );
    conn.release();

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Product added successfully',
      product: { id: result.insertId, name, price, quantity, description, category }
    });
  } catch (err) {
    console.error('Product add failed:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
};

export const updateProduct = async (req, res) => {
  const { product_id } = req.params;
  const { price, quantity, description, category } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Build dynamic update query based on provided fields
    let query = 'UPDATE products SET ';
    const updates = [];
    const values = [];
    
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (quantity !== undefined) {
      updates.push('quantity = ?');
      values.push(quantity);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    
    if (updates.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    values.push(product_id);
    
    await conn.execute(query, values);
    conn.release();

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { product_id } = req.params;

  try {
    const conn = await pool.getConnection();
    await conn.execute('DELETE FROM products WHERE id = ?', [product_id]);
    conn.release();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Product deletion failed:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
};