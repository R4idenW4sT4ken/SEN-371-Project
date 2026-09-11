import Review from "../models/Review.js";

export const reviewRepository = {
  async findByProduct(productId) {
    return Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
  },

  async findByProductAndUser(productId, userId) {
    return Review.findOne({ product: productId, user: userId });
  },

  async findById(id) {
    return Review.findById(id).populate("user", "name");
  },

  async create(data) {
    return Review.create(data);
  },

  async update(id, data) {
    return Review.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate("user", "name");
  },

  async remove(id) {
    return Review.findByIdAndDelete(id);
  }
};

export default reviewRepository;