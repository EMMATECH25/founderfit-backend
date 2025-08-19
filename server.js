const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const formRoutes = require("./routes/form.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://founderfit.netlify.app',
    'http://localhost:3000',
    'https://illustrious-narwhal-8f5ff2.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe requires raw body for webhooks
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Normal JSON parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/form", formRoutes);
app.use("/api/payment", paymentRoutes);

// DB test
db.getConnection()
  .then(() => console.log("✅ MySQL connected successfully"))
  .catch(err => console.error("❌ MySQL connection failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
