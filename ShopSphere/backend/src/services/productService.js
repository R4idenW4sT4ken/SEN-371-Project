import { productRepository, clampPagination } from "../repositories/productRepository.js";
import { categoryRepository } from "../repositories/categoryRepository.js";

export const productService = {
  async getAllProducts(query) {
    const { safePage, safeLimit } = clampPagination(query.page, query.limit);

    const [products, total] = await Promise.all([
      productRepository.findAll(query),
      productRepository.count(query.category ? { category: query.category } : {}),
    ]);

    // Report the limit/page that was actually applied (after clamping),
    // not whatever raw value the client sent - otherwise a request like
    // ?limit=999999 gets silently clamped to 100 results but the response
    // metadata would misleadingly still echo back "limit": 999999.
    return { products, total, page: safePage, limit: safeLimit };
  },

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },

  async createProduct(data) {
    const { name, description, price, stock, category, images } = data;

    if (!name?.trim() || !description?.trim()) {
      throw new Error("Name and description are required");
    }
    if (price === undefined || price < 0) {
      throw new Error("Price must be a non-negative number");
    }
    if (!category) {
      throw new Error("A valid category is required");
    }

    const categoryExists = await categoryRepository.findById(category);
    if (!categoryExists) {
      throw new Error("Category not found");
    }

    return productRepository.create({
      name: name.trim(),
      description: description.trim(),
      price,
      stock: stock ?? 0,
      category,
      images: images ?? [],
    });
  },

  async updateProduct(id, data) {
    // Whitelist which fields a PUT can actually change, rather than passing
    // the raw request body straight through - and apply the same price/stock
    // validation createProduct already had (update previously had none at all,
    // so a crafted request could set a negative price or stock via PUT).
    const allowedFields = ["name", "description", "price", "stock", "category", "images"];
    const update = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        update[field] = data[field];
      }
    }

    if (update.price !== undefined && (typeof update.price !== "number" || update.price < 0)) {
      throw new Error("Price must be a non-negative number");
    }
    if (update.stock !== undefined && (typeof update.stock !== "number" || update.stock < 0)) {
      throw new Error("Stock must be a non-negative number");
    }
    if (update.name !== undefined && !update.name?.trim()) {
      throw new Error("Name and description are required");
    }
    if (update.description !== undefined && !update.description?.trim()) {
      throw new Error("Name and description are required");
    }

    if (update.category) {
      const categoryExists = await categoryRepository.findById(update.category);
      if (!categoryExists) {
        throw new Error("Category not found");
      }
    }

    const product = await productRepository.update(id, update);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },

  async deleteProduct(id) {
    const product = await productRepository.remove(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  },
};

export default productService;
