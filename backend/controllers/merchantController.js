//controllers/merchatController.js

import { geocodeAddress, reverseGeocode, getShortAddress } from '../utils/geocode.js';
import pool from '../config/database.js';

export const addMerchant = async (req, res) => {
  const { shop_name, address, owner_name, phone, latitude, longitude, use_manual_coords } = req.body;

  if (!shop_name) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    let coords = null;
    let finalAddress = address;

    // Determine coordinates and address
    if (use_manual_coords && latitude !== undefined && longitude !== undefined) {
      // Use manual coordinates provided by user
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ error: 'Invalid latitude or longitude values' });
      }
      
      coords = { lat, lng };
      
      // If no address provided but we have coordinates, generate address from coordinates
      if (!address || address.trim() === '') {

        try {
          const generatedAddress = await getShortAddress(lat, lng);
          if (generatedAddress) {
            finalAddress = generatedAddress;
          }
        } catch (error) {
          console.error('Error generating address from coordinates:', error);
        }
      }
    } else if (address) {
      // Geocode address if provided
      coords = await geocodeAddress(address);
      if (!coords) {
        return res.status(400).json({ error: 'Could not geocode address. Please provide valid address or use manual coordinates.' });
      }
    } else {
      return res.status(400).json({ error: 'Either address or coordinates (latitude, longitude) are required' });
    }

    if (!coords) {
      return res.status(400).json({ error: 'Could not determine location. Please provide valid address or coordinates.' });
    }

    const conn = await pool.getConnection();
    const [result] = await conn.execute(
      'INSERT INTO merchants (shop_name, address, latitude, longitude, owner_name, phone, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [shop_name, finalAddress || null, coords.lat, coords.lng, owner_name || null, phone || null, req.user.id]
    );
    conn.release();

    res.status(201).json({ 
      id: result.insertId, 
      shop_name, 
      address: finalAddress, 
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

// Get current merchant's details
export const getMyMerchantDetails = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [merchants] = await conn.execute('SELECT * FROM merchants WHERE user_id = ?', [req.user.id]);
    conn.release();
    
    if (!merchants.length) {
      return res.status(404).json({ error: 'Merchant not found for this user' });
    }
    
    res.json(merchants[0]);
  } catch (err) {
    console.error('Failed to fetch merchant details:', err);
    res.status(500).json({ error: 'Failed to fetch merchant details', details: err.message });
  }
};

// Update merchant details
export const updateMerchantDetails = async (req, res) => {
  const { shop_name, address, owner_name, phone, latitude, longitude, use_manual_coords } = req.body;

  if (!shop_name) {
    return res.status(400).json({ error: 'Shop name is required' });
  }

  try {
    const conn = await pool.getConnection();
    
    // Check if merchant exists for this user
    const [merchants] = await conn.execute('SELECT id FROM merchants WHERE user_id = ?', [req.user.id]);
    if (!merchants.length) {
      conn.release();
      return res.status(404).json({ error: 'Merchant not found for this user' });
    }

    const merchantId = merchants[0].id;
    let coords = null;
    let finalAddress = address;
    
    // Determine coordinates to use
    if (use_manual_coords && latitude !== undefined && longitude !== undefined) {
      // Use manual coordinates provided by user (current location or manual input)
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        conn.release();
        return res.status(400).json({ error: 'Invalid latitude or longitude values' });
      }
      
      coords = { lat, lng };
      
      // If no address provided but we have coordinates, generate address from coordinates
      if (!address || address.trim() === '') {

        try {
          const generatedAddress = await getShortAddress(lat, lng);
          if (generatedAddress) {
            finalAddress = generatedAddress;
          }
        } catch (error) {
          console.error('Error generating address from coordinates:', error);
        }
      }
    } else if (address) {
      // Geocode address if provided and not using manual coordinates
      coords = await geocodeAddress(address);
      if (!coords) {
        conn.release();
        return res.status(400).json({ error: 'Could not geocode address. Please provide valid address or use manual coordinates.' });
      }
    }

    // Update merchant details
    if (coords) {
      await conn.execute(
        'UPDATE merchants SET shop_name = ?, address = ?, latitude = ?, longitude = ?, owner_name = ?, phone = ? WHERE id = ?',
        [shop_name, finalAddress || null, coords.lat, coords.lng, owner_name || null, phone || null, merchantId]
      );
    } else {
      // Update without coordinates if neither address nor manual coords provided
      await conn.execute(
        'UPDATE merchants SET shop_name = ?, address = ?, owner_name = ?, phone = ? WHERE id = ?',
        [shop_name, finalAddress || null, owner_name || null, phone || null, merchantId]
      );
    }
    
    conn.release();

    res.json({ 
      message: 'Merchant details updated successfully',
      shop_name,
      address: finalAddress,
      owner_name,
      phone,
      location: coords
    });
  } catch (err) {
    console.error('Merchant update failed:', err);
    res.status(500).json({ error: 'Failed to update merchant details', details: err.message });
  }
};