import api from "../services/api.js";

export const cartApi = {
  get: () => api.get("/cart"),
  addItem: (productId, quantity = 1) =>
    api.post("/cart/items", { productId, quantity }),
  updateItem: (productId, quantity) =>
    api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`)
};

export default cartApi;
