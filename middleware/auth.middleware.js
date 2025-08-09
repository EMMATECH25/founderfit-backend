// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');

    // Check if user exists in "users" table (paid users only)
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND email = ?',
      [decoded.id, decoded.email]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        error: 'Your account is not active. Please complete payment to continue.'
      });
    }

    const user = rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Your account is not active. Please complete payment to continue.'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
