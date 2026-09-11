import { Router } from "express";
import { getCategories, createCategory } from "../controllers/categoryController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getCategories);
router.post("/", authenticate, requireAdmin, createCategory);

export default router;
