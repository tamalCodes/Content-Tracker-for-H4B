const express = require("express");
const { getEmailStatus, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/email-status", getEmailStatus);
router.post("/login", loginUser);

module.exports = router;
