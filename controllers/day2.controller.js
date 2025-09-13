const db = require("../config/db");

// ✅ Save or update Day2 responses
exports.saveDay2 = async (req, res) => {
  const userId = req.user.id; // from auth.middleware.js
  const {
    selection_criteria,
    location,
    scalability,
    risk_tolerance,
    time_commitment,
  } = req.body;

  try {
    // --- Validation Rules ---
    if (!Array.isArray(selection_criteria) || selection_criteria.length !== 2) {
      return res
        .status(400)
        .json({ error: "Please select exactly 2 criteria." });
    }

    if (!location) {
      return res.status(400).json({ error: "Please select a location." });
    }
    if (!scalability) {
      return res.status(400).json({ error: "Please select a scalability option." });
    }
    if (!risk_tolerance) {
      return res.status(400).json({ error: "Please select a risk tolerance level." });
    }
    if (!time_commitment) {
      return res.status(400).json({ error: "Please select a time commitment." });
    }

    // --- Check if user already has a record ---
    const [existing] = await db.execute(
      "SELECT id FROM day2_responses WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        `UPDATE day2_responses 
         SET selection_criteria = ?, location = ?, scalability = ?, risk_tolerance = ?, time_commitment = ?, updated_at = NOW() 
         WHERE user_id = ?`,
        [
          JSON.stringify(selection_criteria),
          location,
          scalability,
          risk_tolerance,
          time_commitment,
          userId,
        ]
      );
      return res.json({ message: "Day2 responses updated successfully ✅" });
    } else {
      // Insert new record
      await db.execute(
        `INSERT INTO day2_responses 
         (user_id, selection_criteria, location, scalability, risk_tolerance, time_commitment) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          JSON.stringify(selection_criteria),
          location,
          scalability,
          risk_tolerance,
          time_commitment,
        ]
      );
      return res.json({ message: "Day2 responses saved successfully ✅" });
    }
  } catch (err) {
    console.error("❌ Error saving Day2 responses:", err.message);
    res.status(500).json({ error: "Server error while saving Day2 responses" });
  }
};

// ✅ Get Day2 responses
// ✅ Get Day2 responses
exports.getDay2 = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT selection_criteria, location, scalability, risk_tolerance, time_commitment FROM day2_responses WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ message: "No responses found yet", data: null });
    }

    const response = rows[0];

    // 🔒 Safe parse for selection_criteria
    try {
      response.selection_criteria = JSON.parse(response.selection_criteria);
    } catch (e) {
      console.warn(
        "⚠️ Invalid JSON in selection_criteria, returning fallback:",
        response.selection_criteria
      );

      // If it's a string, wrap it in an array, else fallback to empty array
      if (typeof response.selection_criteria === "string") {
        response.selection_criteria = [response.selection_criteria];
      } else {
        response.selection_criteria = [];
      }
    }

    res.json({ data: response });
  } catch (err) {
    console.error("❌ Error fetching Day2 responses:", err.message);
    res
      .status(500)
      .json({ error: "Server error while fetching Day2 responses" });
  }
};

