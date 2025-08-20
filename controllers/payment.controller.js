const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// ✅ Fallback for local testing
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// 1️⃣ Create Checkout Session
exports.createCheckoutSession = async (req, res) => {
  const { email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "28-Day Challenge Access" },
            unit_amount: 1999, // 💵 $19.99
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { email },
      success_url: `${FRONTEND_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment-failed`,
    });

    console.log("✅ Checkout session created:", session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Failed to create checkout session:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// 2️⃣ Webhook Handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("📥 Incoming webhook received");

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("🔔 Webhook event verified:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;
    const sessionId = session.id;

    console.log("✅ Payment completed for session:", sessionId);
    console.log("📧 Extracted email from session:", email);

    if (!email || !sessionId) {
      console.warn("⚠️ Missing email or session ID in webhook payload");
      return res.status(400).json({ error: "Missing required data in session" });
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      console.log("🔐 JWT token generated:", token);
    } catch (err) {
      console.error("❌ Failed to generate JWT token:", err.message);
      return res.status(500).json({ error: "Token generation failed" });
    }

    // Attempt DB insert
    try {
      console.log("📦 Attempting DB insert for session:", sessionId);
      const [result] = await db.execute(
        "INSERT INTO payment_tokens (session_id, token) VALUES (?, ?)",
        [sessionId, token]
      );
      console.log("✅ DB insert result:", result);
      console.log("🎉 Token successfully stored for session:", sessionId);
    } catch (err) {
      console.error("❌ DB insert error:", err.message);
      return res.status(500).json({ error: "Database insert failed" });
    }
  } else {
    console.log("ℹ️ Ignored event type:", event.type);
  }

  res.json({ received: true });
};

// 3️⃣ Get Token by Session ID
exports.getToken = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT token FROM payment_tokens WHERE session_id = ?",
      [sessionId]
    );

    if (rows.length === 0) {
      console.warn("⚠️ No token found for session:", sessionId);
      return res.status(404).json({ error: "No token found for session" });
    }

    console.log("🔑 Token retrieved for session:", sessionId);
    res.json({ token: rows[0].token });
  } catch (err) {
    console.error("❌ Server error while retrieving token:", err);
    res.status(500).json({ error: "Server error" });
  }
};