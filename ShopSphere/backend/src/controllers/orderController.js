import orderService from "../services/orderService.js";

const ORDER_NOT_FOUND = "Order not found";

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    if (
      error.message === "Your cart is empty" ||
      error.message === "Shipping address is required" ||
      error.message === "A cart item no longer exists" ||
      error.message.startsWith("Insufficient stock")
    ) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const result = await orderService.getOrders(req.user.id, isAdmin, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const order = await orderService.getOrderById(req.user.id, isAdmin, req.params.id);
    res.json(order);
  } catch (error) {
    if (error.message === ORDER_NOT_FOUND) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const order = await orderService.cancelOrder(req.user.id, isAdmin, req.params.id);
    res.json(order);
  } catch (error) {
    if (error.message === ORDER_NOT_FOUND) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Only pending orders can be cancelled") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    if (error.message === ORDER_NOT_FOUND) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Invalid order status") {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};