const db = require("../config/db");

// ✅ Save or update Day3 responses
exports.saveDay3 = async (req, res) => {
  const userId = req.user.id;
  const { ideas } = req.body;

  try {
    // --- Validation ---
    if (!Array.isArray(ideas) || ideas.length === 0) {
      return res.status(400).json({ error: "Please provide at least one idea with solution and score." });
    }

    // Each row must have idea, solution, score
    for (let row of ideas) {
      if (!row.idea || !row.solution || typeof row.score !== "number") {
        return res.status(400).json({ error: "Each entry must include idea, solution, and score." });
      }
    }

    // --- Check if user already has a record ---
    const [existing] = await db.execute(
      "SELECT id FROM day3_responses WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      // Update existing record
      await db.execute(
        `UPDATE day3_responses 
         SET ideas = ?, updated_at = NOW() 
         WHERE user_id = ?`,
        [JSON.stringify(ideas), userId]
      );
      return res.json({ message: "Day3 responses updated successfully ✅" });
    } else {
      // Insert new record
      await db.execute(
        `INSERT INTO day3_responses (user_id, ideas) VALUES (?, ?)`,
        [userId, JSON.stringify(ideas)]
      );
      return res.json({ message: "Day3 responses saved successfully ✅" });
    }
  } catch (err) {
    console.error("❌ Error saving Day3 responses:", err.message);
    res.status(500).json({ error: "Server error while saving Day3 responses" });
  }
};

// ✅ Get Day3 responses
// ✅ Get Day3 responses
exports.getDay3 = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT ideas FROM day3_responses WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ message: "No responses found yet", data: [] });
    }

    let ideas = rows[0].ideas;

    // Some MySQL drivers return JSON columns as objects already
    if (typeof ideas === "string") {
      ideas = JSON.parse(ideas);
    }

    res.json({ data: ideas }); // <-- return clean array directly
  } catch (err) {
    console.error("❌ Error fetching Day3 responses:", err.message);
    res.status(500).json({ error: "Server error while fetching Day3 responses" });
  }
};

