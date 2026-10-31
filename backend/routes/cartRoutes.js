
const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All cart routes require login
router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/items/:productId", protect, updateCartItem);
router.delete("/items/:productId", protect, removeCartItem);
router.delete("/", protect, clearCart);

module.exports = router;
