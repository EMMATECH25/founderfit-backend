const express = require("express");
const router = express.Router();
const { saveDay2, getDay2 } = require("../controllers/day2.controller");
const auth = require("../middleware/auth.middleware");

router.post("/day2/save", auth, saveDay2);
router.get("/day2/get", auth, getDay2);

module.exports = router;
