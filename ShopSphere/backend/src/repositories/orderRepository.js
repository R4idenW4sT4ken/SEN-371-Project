import Order from "../models/Order.js";

const MAX_PAGE_SIZE = 100;

function clampPagination(page, limit) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), MAX_PAGE_SIZE);
  const safePage = Math.max(Number(page) || 1, 1);
  return { safeLimit, safePage, skip: (safePage - 1) * safeLimit };
}

export const orderRepository = {
  async create(data) {
    return Order.create(data);
  },

  async findById(id) {
    return Order.findById(id)
      .populate("items.product", "name")
      .populate("owner", "name email");
  },

  async findByOwnerAndId(ownerId, id) {
    return Order.findOne({ _id: id, owner: ownerId })
      .populate("items.product", "name");
  },

  async findByOwner(ownerId, { page = 1, limit = 20 } = {}) {
    const { safeLimit, skip } = clampPagination(page, limit);
    return Order.find({ owner: ownerId })
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const { safeLimit, skip } = clampPagination(page, limit);
    return Order.find()
      .populate("items.product", "name")
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);
  },

  async count(filter = {}) {
    return Order.countDocuments(filter);
  },

  async updateStatus(id, status) {
    return Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate("items.product", "name")
      .populate("owner", "name email");
  }
};

export default orderRepository;