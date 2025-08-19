const express = require("express");
const router = express.Router();
const { createCheckoutSession, getToken, handleWebhook } = require("../controllers/payment.controller");

// Create Stripe checkout session
router.post("/create-checkout-session", createCheckoutSession);

// Get token by sessionId
router.get("/get-token/:sessionId", getToken);

// Stripe webhook
router.post("/webhook", handleWebhook);

module.exports = router;
