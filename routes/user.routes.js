const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.first_name} ${req.user.last_name}`, user: req.user });
});

module.exports = router;
