const express = require("express");
const router = express.Router();
const day1Controller = require("../controllers/day1.controller");
const authMiddleware = require("../middleware/auth.middleware"); // ✅ checks JWT

// Save skills & passions
router.post("/save", authMiddleware, day1Controller.saveSkillsPassions);

// Get saved skills & passions
router.get("/get", authMiddleware, day1Controller.getSkillsPassions);

router.put("/update/:id", authMiddleware, day1Controller.updateSkillPassion);

module.exports = router;
