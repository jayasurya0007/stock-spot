//controllers/merchatController.js

import { geocodeAddress } from '../utils/geocode.js';
import pool from '../config/database.js';

export const addMerchant = async (req, res) => {
  const { shop_name, address, owner_name, phone } = req.body;

  if (!shop_name || !address) {
    return res.status(400).json({ error: 'Shop name and address are required' });
  }

  try {
    const coords = await geocodeAddress(address);
    if (!coords) {
      return res.status(400).json({ error: 'Could not geocode address' });
    }

    const conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO merchants (shop_name, address, latitude, longitude, owner_name, phone, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [shop_name, address, coords.lat, coords.lng, owner_name || null, phone || null, req.user.id]
    );
    conn.release();

    res.status(201).json({ 
      id: result.insertId, 
      shop_name, 
      address, 
      location: coords,
      owner_name,
      phone
    });
  } catch (err) {
    console.error('Merchant add failed:', err);
    res.status(500).json({ error: 'Failed to add merchant' });
  }
};

export const getMerchantProducts = async (req, res) => {
  const { merchant_id } = req.params;
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM products WHERE merchant_id = ? ORDER BY name',
      [merchant_id]
    );
    conn.release();
    res.json({ products: rows });
  } catch (err) {
    console.error('Failed to fetch merchant products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
};

// Get all merchants
export const getMerchants = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute('SELECT * FROM merchants ORDER BY shop_name');
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error('Failed to fetch merchants:', err);
    res.status(500).json({ error: 'Failed to fetch merchants', details: err.message });
  }
};