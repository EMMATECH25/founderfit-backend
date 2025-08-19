// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const formRoutes = require('./routes/form.routes');


const app = express();

// Middleware
app.use(cors({
  origin: [
        'https://founderfit.netlify.app',
      'https://illustrious-narwhal-8f5ff2.netlify.app'],
   // for local frontend testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // ✅ Protected routes here
app.use('/api/form', formRoutes);


// Test DB connection
db.getConnection()
  .then(() => console.log('✅ MySQL connected successfully'))
  .catch(err => console.error('❌ MySQL connection failed:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
