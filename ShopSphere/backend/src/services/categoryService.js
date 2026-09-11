import { categoryRepository } from "../repositories/categoryRepository.js";

export const categoryService = {
  async getAllCategories() {
    return categoryRepository.findAll();
  },

  async createCategory(name) {
    if (!name?.trim()) {
      throw new Error("Category name is required");
    }
    return categoryRepository.create({ name: name.trim() });
  },
};

export default categoryService;
