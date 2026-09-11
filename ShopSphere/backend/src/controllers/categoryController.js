import { categoryService } from "../services/categoryService.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (error) {
    if (error.message === "Category name is required") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
