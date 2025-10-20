const express = require("express");
const {
  getEmailStatus,
  loginUser,
  createEntry,
} = require("../controllers/authController");

const router = express.Router();

router.post("/email-status", getEmailStatus);
router.post("/login", loginUser);
router.post("/entry", createEntry);

module.exports = router;
