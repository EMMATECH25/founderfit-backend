const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// 1. Create Checkout Session
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
            unit_amount: 1999, // 💵 $19.99 (example, adjust to your price)
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: { email },
      success_url: `${process.env.FRONTEND_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// 2. Webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;

    // Generate JWT token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

    try {
      // Store token in DB
      await db.execute(
        "INSERT INTO payment_tokens (session_id, token) VALUES (?, ?)",
        [session.id, token]
      );

      console.log(`✅ Payment successful for ${email}, token saved`);
    } catch (err) {
      console.error("DB insert error:", err);
    }
  }

  res.json({ received: true });
};

// 3. Get token
exports.getToken = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT token FROM payment_tokens WHERE session_id = ?",
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No token found for session" });
    }

    res.json({ token: rows[0].token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
