import Cart from "../models/Cart.js";

const cartRepository = {
  // Find a cart belonging to a user
  async findByOwner(ownerId) {
    return await Cart.findOne({ owner: ownerId })
      .populate("items.product");
  },

  // Create a new cart for a user
  async create(ownerId) {
    const cart = new Cart({
      owner: ownerId,
      items: []
    });

    return await cart.save();
  },

  // Add a product to the cart
  async addItem(ownerId, productId, quantity) {
    let cart = await Cart.findOne({ owner: ownerId });

    if (!cart) {
      cart = new Cart({
        owner: ownerId,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }

    await cart.save();

    return await Cart.findById(cart._id)
      .populate("items.product");
  },

  // Update the quantity of an item
  async updateItem(ownerId, productId, quantity) {
    const cart = await Cart.findOne({ owner: ownerId });

    if (!cart) {
      return null;
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return null;
    }

    item.quantity = quantity;

    await cart.save();

    return await Cart.findById(cart._id)
      .populate("items.product");
  },

  // Remove a product from the cart
  async removeItem(ownerId, productId) {
    const cart = await Cart.findOne({ owner: ownerId });

    if (!cart) {
      return null;
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    return await Cart.findById(cart._id)
      .populate("items.product");
  },

  // Empty the entire cart
  async clearCart(ownerId) {
    const cart = await Cart.findOne({ owner: ownerId });

    if (!cart) {
      return null;
    }

    cart.items = [];

    await cart.save();

    return cart;
  }
};

export default cartRepository;