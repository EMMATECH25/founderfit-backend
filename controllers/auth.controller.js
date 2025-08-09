// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // MySQL connection
const dayjs = require('dayjs');
require('dotenv').config();

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    // Check if user already exists in pending_users
    const [existing] = await db.execute('SELECT * FROM pending_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const expiresAt = dayjs().add(48, 'hour').format('YYYY-MM-DD HH:mm:ss');

    // Save to pending_users
    await db.execute(
      `INSERT INTO pending_users (first_name, last_name, email, password_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hash, expiresAt]
    );

    res.status(201).json({ message: 'Signup successful. Please complete payment within 48 hours.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Check if user exists in the "users" table (paid users)
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      // 2. Check if they are in pending_users
      const [pending] = await db.execute(
        'SELECT * FROM pending_users WHERE email = ?',
        [email]
      );

      if (pending.length > 0) {
        return res.status(403).json({
          error: 'Your account is not active. Please complete payment to continue.'
        });
      }

      // If not found in either table
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];

    // 3. Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' } // "Keep me signed in" = 7 days
    );

    // 5. Respond with token & basic user info
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
