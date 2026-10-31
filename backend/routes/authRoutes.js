
const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected profile
router.get("/me", protect, getMyProfile);

module.exports = router;
