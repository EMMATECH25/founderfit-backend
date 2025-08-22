const db = require("../config/db");

// Save Day1-Part1 form data
// Save Day1-Part1 form data
exports.saveSkillsPassions = async (req, res) => {
  const userId = req.user.id;
  let { skills = [], passions = [] } = req.body;

  // Filter: remove fully empty rows
  skills = skills.filter(s => s.description?.trim() || s.score !== null);
  passions = passions.filter(p => p.description?.trim() || p.score !== null);

  // Validation: if description exists but score is missing → reject
  for (let s of skills) {
    if (s.description?.trim() && (s.score === null || s.score === undefined)) {
      return res.status(400).json({ error: "Every skill must have a score (1–10)." });
    }
  }
  for (let p of passions) {
    if (p.description?.trim() && (p.score === null || p.score === undefined)) {
      return res.status(400).json({ error: "Every passion must have a score (1–10)." });
    }
  }

  // Must provide at least one valid skill or passion
  if (skills.length === 0 && passions.length === 0) {
    return res.status(400).json({ error: "Please provide at least one skill or passion with a score." });
  }

  try {
    // Remove old ones if resubmitted
    await db.execute("DELETE FROM user_inputs WHERE user_id = ?", [userId]);

    // Insert new skills
    for (let s of skills) {
      await db.execute(
        "INSERT INTO user_inputs (user_id, type, description, score) VALUES (?, 'skill', ?, ?)",
        [userId, s.description.trim(), s.score]
      );
    }

    // Insert new passions
    for (let p of passions) {
      await db.execute(
        "INSERT INTO user_inputs (user_id, type, description, score) VALUES (?, 'passion', ?, ?)",
        [userId, p.description.trim(), p.score]
      );
    }

    res.json({ message: "✅ Skills and passions saved successfully." });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Fetch saved skills & passions (for Day1-Part2)
exports.getSkillsPassions = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT id, type, description, score, rank_order FROM user_inputs WHERE user_id = ? ORDER BY rank_order ASC, id ASC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an entry (for Day1-Part2 adjustments)
exports.updateSkillPassion = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { description, score, rank_order } = req.body;

  try {
    const [result] = await db.execute(
      "UPDATE user_inputs SET description = ?, score = ?, rank_order = ? WHERE id = ? AND user_id = ?",
      [description, score, rank_order, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found or not authorized" });
    }

    res.json({ message: "✅ Updated successfully." });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
