import cartRepository from "../repositories/cartRepository.js";
import productRepository from "../repositories/productRepository.js";

const getCart = async (userId) => {
  let cart = await cartRepository.findByOwner(userId);

  if (!cart) {
    cart = await cartRepository.create(userId);
  }

  return cart;
};

const addToCart = async (userId, productId, quantity) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a whole number of at least 1");
  }

  // Referential integrity: don't let a cart hold an id that isn't a real
  // product. Without this check, cartRepository.addItem() below would
  // silently push any string into cart.items, and it would only surface
  // as a null entry later, at populate() time.
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // addItem() merges quantities when the product is already in the
  // cart, so validate against the *combined* quantity, not just this
  // request's quantity.
  const existingCart = await cartRepository.findByOwner(userId);
  const existingItem = existingCart?.items.find((item) => {
    const existingId = item.product?._id ?? item.product;
    return existingId?.toString() === productId;
  });
  const requestedTotal = (existingItem?.quantity ?? 0) + quantity;

  if (product.stock < requestedTotal) {
    throw new Error(
      `Only ${product.stock} unit(s) of "${product.name}" left in stock`
    );
  }

  return await cartRepository.addItem(userId, productId, quantity);
};

const updateCartItem = async (userId, productId, quantity) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a whole number of at least 1");
  }

  const product = await productRepository.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error(
      `Only ${product.stock} unit(s) of "${product.name}" left in stock`
    );
  }

  const cart = await cartRepository.updateItem(userId, productId, quantity);

  if (!cart) {
    throw new Error("Cart item not found");
  }

  return cart;
};

const removeFromCart = async (userId, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const cart = await cartRepository.removeItem(userId, productId);

  if (!cart) {
    throw new Error("Cart not found");
  }

  return cart;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
