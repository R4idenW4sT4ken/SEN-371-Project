import reviewService from "../services/reviewService.js";

export const getReviewsByProduct = async (req, res, next) => {
  try {
    const reviews = await reviewService.getByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.create(req.user.id, req.params.productId, req.body);
    res.status(201).json(review);
  } catch (error) {
    if (
      error.message === "Product ID is required" ||
      error.message === "Rating must be between 1 and 5" ||
      error.message === "Comment is required" ||
      error.message === "Product not found" ||
      error.message === "You have already reviewed this product"
    ) {
      return res.status(error.message === "Product not found" ? 404 : 400).json({ message: error.message });
    }
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const review = await reviewService.update(req.user.id, isAdmin, req.params.id, req.body);
    res.json(review);
  } catch (error) {
    if (error.message === "Review not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message === "Not authorized to edit this review" ||
      error.message === "Rating must be between 1 and 5" ||
      error.message === "Comment is required"
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    await reviewService.remove(req.user.id, isAdmin, req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    if (error.message === "Review not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Not authorized to delete this review") {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};