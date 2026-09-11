import reviewRepository from "../repositories/reviewRepository.js";
import Product from "../models/Product.js";

export const reviewService = {
  async getByProduct(productId) {
    if (!productId) {
      throw new Error("Product ID is required");
    }
    return reviewRepository.findByProduct(productId);
  },

  async create(userId, productId, data) {
    if (!productId) {
      throw new Error("Product ID is required");
    }
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (!data.comment?.trim()) {
      throw new Error("Comment is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const existing = await reviewRepository.findByProductAndUser(productId, userId);
    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    return reviewRepository.create({
      product: productId,
      user: userId,
      rating: data.rating,
      comment: data.comment.trim()
    });
  },

  async update(userId, isAdmin, id, data) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    if (!isAdmin && review.user._id.toString() !== userId.toString()) {
      throw new Error("Not authorized to edit this review");
    }

    const update = {};

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      update.rating = data.rating;
    }
    if (data.comment !== undefined) {
      if (!data.comment?.trim()) {
        throw new Error("Comment is required");
      }
      update.comment = data.comment.trim();
    }

    return reviewRepository.update(id, update);
  },

  async remove(userId, isAdmin, id) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    if (!isAdmin && review.user._id.toString() !== userId.toString()) {
      throw new Error("Not authorized to delete this review");
    }

    return reviewRepository.remove(id);
  }
};

export default reviewService;