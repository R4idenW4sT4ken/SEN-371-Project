import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

// All order endpoints require a valid JWT.
router.use(authenticate);

// GET /api/orders - current user's orders (admin: ?all=true for everything)
router.get("/", getOrders);

// POST /api/orders - checkout: convert the user's cart into an order
router.post("/", createOrder);

// GET /api/orders/:id - a single order (owner or admin)
router.get("/:id", getOrderById);

// PATCH /api/orders/:id/cancel - cancel a pending order (owner or admin)
router.patch("/:id/cancel", cancelOrder);

// PATCH /api/orders/:id/status - update order status (admin only)
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;