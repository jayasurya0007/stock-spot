//routes/auth.js

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, role = 'user', latitude, longitude, shop_name, address, owner_name, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();

    // Create user
    const [result] = await conn.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    const userId = result.insertId;

    // If merchant, create merchant record with GPS and shop details
    if (role === 'merchant') {
      if (!latitude || !longitude) {
        conn.release();
        return res.status(400).json({ error: 'Merchant registration requires location access. Please allow location permissions.' });
      }
      
      // Create minimal merchant record - shop details can be added later
      const merchantShopName = shop_name || `${email.split('@')[0]}'s Shop`;
      const merchantAddress = address || 'Address not provided';
      
      await conn.execute(
        'INSERT INTO merchants (user_id, shop_name, address, latitude, longitude, owner_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, merchantShopName, merchantAddress, latitude, longitude, owner_name || null, phone || null]
      );
    }

    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    conn.release();

    res.status(201).json({
      token,
      user: { id: userId, email, role }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    conn.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;