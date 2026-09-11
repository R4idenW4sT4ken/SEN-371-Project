import orderRepository from "../repositories/orderRepository.js";
import cartRepository from "../repositories/cartRepository.js";
import Product from "../models/Product.js";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;
const VAT_RATE = 0.15;

const round2 = (value) => Math.round(value * 100) / 100;

const generateOrderNumber = () =>
  `SS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

export const orderService = {
  // Checkout flow: read the user's cart, validate stock, decrement stock,
  // snapshot line items, compute totals, persist the order, then clear the cart.
  async createOrder(userId, data) {
    const cart = await cartRepository.findByOwner(userId);
    const cartItems = cart?.items ?? [];

    if (!cartItems.length) {
      throw new Error("Your cart is empty");
    }

    const { street, city, postalCode, country } = data.shippingAddress ?? {};
    if (!street?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim()) {
      throw new Error("Shipping address is required");
    }

    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      if (!product) {
        throw new Error("A cart item no longer exists");
      }
      if (product.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for "${product.name}"`);
      }

      const lineTotal = round2(product.price * cartItem.quantity);
      subtotal = round2(subtotal + lineTotal);

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        total: lineTotal
      });
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = round2(subtotal * VAT_RATE);
    const total = round2(subtotal + shippingFee + tax);

    for (const cartItem of cartItems) {
      await Product.findByIdAndUpdate(cartItem.product._id, {
        $inc: { stock: -cartItem.quantity }
      });
    }

    const order = await orderRepository.create({
      owner: userId,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      subtotal,
      shippingFee,
      tax,
      total,
      shippingAddress: {
        street: street.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim()
      },
      paymentMethod: data.paymentMethod ?? "card",
      status: "pending"
    });

    await cartRepository.clearCart(userId);

    return order;
  },

  async getOrders(userId, isAdmin, query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    if (isAdmin && query.all === "true") {
      return {
        orders: await orderRepository.findAll({ page, limit }),
        total: await orderRepository.count()
      };
    }

    return {
      orders: await orderRepository.findByOwner(userId, { page, limit }),
      total: await orderRepository.count({ owner: userId })
    };
  },

  async getOrderById(userId, isAdmin, id) {
    const order = isAdmin
      ? await orderRepository.findById(id)
      : await orderRepository.findByOwnerAndId(userId, id);

    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  },

  async cancelOrder(userId, isAdmin, id) {
    const order = isAdmin
      ? await orderRepository.findById(id)
      : await orderRepository.findByOwnerAndId(userId, id);

    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    return orderRepository.updateStatus(id, "cancelled");
  },

  async updateStatus(id, status) {
    const allowed = ["pending", "processing", "shipped", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      throw new Error("Invalid order status");
    }

    const order = await orderRepository.updateStatus(id, status);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }
};

export default orderService;