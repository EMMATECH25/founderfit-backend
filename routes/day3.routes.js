const express = require("express");
const router = express.Router();
const { saveDay3, getDay3 } = require("../controllers/day3.controller");
const auth = require("../middleware/auth");

router.post("/day3/save", auth, saveDay3);
router.get("/day3/get", auth, getDay3);

module.exports = router;
