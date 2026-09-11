import { productService } from "../services/productService.js";

export async function getProducts(req, res, next) {
  try {
    const { keyword, category, page, limit } = req.query;
    const { products, total, page: appliedPage, limit: appliedLimit } = await productService.getAllProducts({
      keyword,
      category,
      page,
      limit,
    });
    res.json({
      products,
      meta: {
        page: appliedPage,
        limit: appliedLimit,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (
      error.message === "Name and description are required" ||
      error.message === "Price must be a non-negative number" ||
      error.message === "A valid category is required" ||
      error.message === "Category not found"
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message === "Category not found" ||
      error.message === "Price must be a non-negative number" ||
      error.message === "Stock must be a non-negative number" ||
      error.message === "Name and description are required"
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
}
