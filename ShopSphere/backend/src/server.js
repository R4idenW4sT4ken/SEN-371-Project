import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { sanitizeInput } from "./middleware/sanitize.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

// Required so express-rate-limit (and any IP-based logic) sees the real
// client IP instead of the reverse proxy's IP once this is deployed behind
// Render/Railway/etc (Milestone 5). Without this, rate limiting can end up
// applied to every user collectively (or bypassed entirely) in production.
app.set("trust proxy", 1);

app.use(helmet());

// Support one or more comma-separated origins (useful since teammates each
// run the frontend on different local ports), and restrict to only the
// methods/headers this API actually uses instead of allowing everything.
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(sanitizeInput);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Try again later." }
});

// A more generous limiter applied to every API route, so endpoints beyond
// auth (orders, reviews, product search, etc.) also have basic abuse
// protection rather than being completely unlimited.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down and try again shortly." }
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    message: "ShopSphere API",
    version: "1.0.0",
    documentation: "See README.md for endpoint reference",
    endpoints: {
      auth: ["/api/auth/register", "/api/auth/login", "/api/auth/me"],
      products: ["/api/products", "/api/products/:id"],
      categories: ["/api/categories"],
      cart: ["/api/cart", "/api/cart/items/:productId"],
      orders: ["/api/orders", "/api/orders/:id"],
      reviews: ["/api/reviews/product/:productId", "/api/reviews/products/:productId"]
    },
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "ShopSphere API is running" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api", (req, res) => {
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const normalizedError = error instanceof Error
    ? error
    : new Error(String(error || "Unknown error"));

  if (res.headersSent) {
    return next(normalizedError);
  }

  const isMalformedJson = normalizedError instanceof SyntaxError &&
    normalizedError.status === 400 &&
    normalizedError.type === "entity.parse.failed";

  if (isMalformedJson) {
    return res.status(400).json({ message: "Malformed JSON request body" });
  }

  if (
    normalizedError.name === "ValidationError" ||
    normalizedError.name === "CastError"
  ) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  if (normalizedError.code === 11000) {
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  const status = Number.isInteger(normalizedError.statusCode) &&
    normalizedError.statusCode >= 400 &&
    normalizedError.statusCode < 600
    ? normalizedError.statusCode
    : Number.isInteger(normalizedError.status) &&
      normalizedError.status >= 400 &&
      normalizedError.status < 600
      ? normalizedError.status
      : 500;

  console.error(normalizedError.stack || normalizedError.message);
  return res.status(status).json({
    message: status === 500 ? "Internal server error" : normalizedError.message
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`ShopSphere backend running on http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error("HTTP server failed:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer();