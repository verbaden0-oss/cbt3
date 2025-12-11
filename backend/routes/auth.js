const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    // Check if user exists
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      // User exists, verify password
      const user = result.rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user: { id: user.id, email: user.email }, token });
    } else {
      // User does not exist, create new account
      const hashed = await bcrypt.hash(password, 10);
      const insertResult = await pool.query(
        'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
        [email, hashed]
      );

      const newUserId = insertResult.rows[0].id;
      const token = jwt.sign({ userId: newUserId }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ user: { id: newUserId, email: email }, token, isNewUser: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
