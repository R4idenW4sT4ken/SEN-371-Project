import api from "../services/api.js";

export const reviewApi = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (productId, payload) => api.post(`/reviews/products/${productId}`, payload),
  update: (id, payload) => api.put(`/reviews/${id}`, payload),
  remove: (id) => api.delete(`/reviews/${id}`)
};

export default reviewApi;
