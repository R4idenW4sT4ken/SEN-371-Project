import Product from "../models/Product.js";

const MAX_PAGE_SIZE = 100;

// Escapes regex metacharacters in user-supplied search input before it's
// used to build a MongoDB $regex filter. Without this, a crafted keyword
// (e.g. containing catastrophic-backtracking patterns) can hang the query -
// a classic ReDoS / regex-injection vector on any search endpoint that
// builds a regex from raw request input.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function clampPagination(page, limit) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), MAX_PAGE_SIZE);
  const safePage = Math.max(Number(page) || 1, 1);
  return { safePage, safeLimit };
}

export const productRepository = {
  // Database access is isolated in the repository. All methods below
  // now query MongoDB directly through Mongoose (previously hardcoded
  // demo data - see Milestone 2 Database Integration).
  async findAll({ keyword, category, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (keyword) {
      const safeKeyword = escapeRegex(String(keyword));
      filter.$or = [
        { name: { $regex: safeKeyword, $options: "i" } },
        { description: { $regex: safeKeyword, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }

    const { safePage, safeLimit } = clampPagination(page, limit);
    const skip = (safePage - 1) * safeLimit;

    return Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);
  },

  async count(filter = {}) {
    return Product.countDocuments(filter);
  },

  async findById(id) {
    return Product.findById(id).populate("category", "name slug");
  },

  async create(data) {
    return Product.create(data);
  },

  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async remove(id) {
    return Product.findByIdAndDelete(id);
  },
};

export default productRepository;
