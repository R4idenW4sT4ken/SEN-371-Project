import Category from "../models/Category.js";

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const categoryRepository = {
  async findAll() {
    return Category.find().sort({ name: 1 });
  },

  async findById(id) {
    return Category.findById(id);
  },

  async create({ name }) {
    return Category.create({ name, slug: slugify(name) });
  },
};

export default categoryRepository;
