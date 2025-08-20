const express = require("express");
const router = express.Router();
const { createCheckoutSession, getToken, handleWebhook } = require("../controllers/payment.controller");

// Create Stripe checkout session
router.post("/create-checkout-session", createCheckoutSession);

// Get token by sessionId
router.get("/get-token/:sessionId", getToken);

// Stripe webhook — use raw body parser here
const bodyParser = require("body-parser");
router.post("/webhook", bodyParser.raw({ type: "application/json" }), handleWebhook);

module.exports = router;