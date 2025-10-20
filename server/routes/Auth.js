const express = require("express");
const {
  getEmailStatus,
  loginUser,
  createEntry,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/email-status", getEmailStatus);
router.post("/login", loginUser);
router.post("/entry", createEntry);
router.post("/logout", logoutUser);

module.exports = router;
