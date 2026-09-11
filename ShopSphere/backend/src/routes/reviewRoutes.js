import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getReviewsByProduct,
  createReview,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";

const router = express.Router();

// Public
router.get("/product/:productId", getReviewsByProduct);

// Authenticated
router.post("/products/:productId", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;