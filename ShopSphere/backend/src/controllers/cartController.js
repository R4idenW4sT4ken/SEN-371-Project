import cartService from "../services/cartService.js";

const NOT_FOUND_MESSAGES = new Set([
  "Product not found",
  "Cart not found",
  "Cart item not found",
]);

function respondWithCartError(error, res, next) {
  if (NOT_FOUND_MESSAGES.has(error.message)) {
    return res.status(404).json({ message: error.message });
  }
  if (
    error.message === "Product ID is required" ||
    error.message === "Quantity must be a whole number of at least 1" ||
    error.message.startsWith("Only ")
  ) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
}

// GET /api/cart
// View the current user's cart
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await cartService.getCart(userId);

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/items
// Add an item to the cart
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await cartService.addToCart(userId, productId, quantity);

    res.status(200).json(cart);
  } catch (error) {
    respondWithCartError(error, res, next);
  }
};

// PUT /api/cart/items/:productId
// Update the quantity of a cart item
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(userId, productId, quantity);

    res.status(200).json(cart);
  } catch (error) {
    respondWithCartError(error, res, next);
  }
};

// DELETE /api/cart/items/:productId
// Remove an item from the cart
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await cartService.removeFromCart(userId, productId);

    res.status(200).json(cart);
  } catch (error) {
    respondWithCartError(error, res, next);
  }
};
