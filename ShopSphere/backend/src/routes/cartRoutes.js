import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/cart
// View the current user's cart
router.get("/", authenticate, getCart);

// POST /api/cart/items
// Add an item to the cart
router.post("/items", authenticate, addToCart);

// PUT /api/cart/items/:productId
// Update the quantity of a cart item
router.put("/items/:productId", authenticate, updateCartItem);

// DELETE /api/cart/items/:productId
// Remove an item from the cart
router.delete("/items/:productId", authenticate, removeFromCart);

export default router;