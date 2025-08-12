const express = require('express');
const router = express.Router();
const db = require('../config/db');


// POST /form/skills
router.post('/skills', async (req, res) => {
  const { user_id, skills } = req.body;

  if (!Array.isArray(skills) || skills.length > 6) {
    return res.status(400).json({ error: 'You can submit up to 6 skills.' });
  }

  try {
    for (const { skill, score } of skills) {
      await db.query(
        'INSERT INTO skills (user_id, skill, score) VALUES (?, ?, ?)',
        [user_id, skill, score]
      );
    }
    res.json({ message: 'Skills saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// POST /form/passions
router.post('/passions', async (req, res) => {
  const { user_id, passions } = req.body;

  if (!Array.isArray(passions) || passions.length > 7) {
    return res.status(400).json({ error: 'You can submit up to 7 passions.' });
  }

  try {
    for (const { passion, score } of passions) {
      await db.query(
        'INSERT INTO passions (user_id, passion, score) VALUES (?, ?, ?)',
        [user_id, passion, score]
      );
    }
    res.json({ message: 'Passions saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});


// GET /api/form/skills/:user_id
router.get('/skills/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT skill, score FROM skills WHERE user_id = ?',
      [user_id]
    );
    res.json({ skills: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

// GET /api/form/passions/:user_id
router.get('/passions/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT passion, score FROM passions WHERE user_id = ?',
      [user_id]
    );
    res.json({ passions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error.' });
  }
});

router.get('/sample', (req, res) => {
  const sampleForm = {
    user_id: 0,
    skills: [
      { skill: "Data Analysis", score: 9 },
      { skill: "Public Speaking", score: 8 },
      { skill: "Project Management", score: 7 },
      { skill: "Team Leadership", score: 8 },
      { skill: "Critical Thinking", score: 9 },
      { skill: "Time Management", score: 7 }
    ],
    passions: [
      { passion: "Education", score: 10 },
      { passion: "Social Justice", score: 9 },
      { passion: "Entrepreneurship", score: 8 },
      { passion: "Technology", score: 9 },
      { passion: "Community Building", score: 7 },
      { passion: "Health & Wellness", score: 8 },
      { passion: "Environmental Sustainability", score: 9 }
    ]
  };

  res.json(sampleForm);
});

router.post('/save-form', async (req, res) => {
  const { user_id, skills, passions } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM forms WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE forms SET skills = ?, passions = ?, status = ?, updated_at = NOW() WHERE user_id = ?',
        [JSON.stringify(skills), JSON.stringify(passions), 'draft', user_id]
      );
    } else {
      await db.query(
        'INSERT INTO forms (user_id, skills, passions, status) VALUES (?, ?, ?, ?)',
        [user_id, JSON.stringify(skills), JSON.stringify(passions), 'draft']
      );
    }

    res.json({ message: 'Form saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save form.' });
  }
});


router.post('/submit-form', async (req, res) => {
  const { user_id, skills, passions } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM forms WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE forms SET skills = ?, passions = ?, status = ?, submitted_at = NOW() WHERE user_id = ?',
        [JSON.stringify(skills), JSON.stringify(passions), 'submitted', user_id]
      );
    } else {
      await db.query(
        'INSERT INTO forms (user_id, skills, passions, status, submitted_at) VALUES (?, ?, ?, ?, NOW())',
        [user_id, JSON.stringify(skills), JSON.stringify(passions), 'submitted']
      );
    }

    res.json({ message: 'Form submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit form.' });
  }
});

router.post('/generate-form', async (req, res) => {
  const { bio, goals } = req.body;

  // Simulate AI generation (replace with actual AI logic or API call)
  const generatedForm = {
    skills: [
      { skill: "Strategic Planning", score: 9 },
      { skill: "Team Leadership", score: 8 }
    ],
    passions: [
      { passion: "Youth Empowerment", score: 10 },
      { passion: "Innovation", score: 9 }
    ]
  };

  res.json(generatedForm);
});

module.exports = router;