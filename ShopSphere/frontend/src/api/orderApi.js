import api from "../services/api.js";

export const orderApi = {
  getAll: () => api.get("/orders"),
  getAllForAdmin: () => api.get("/orders", { params: { all: "true" } }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (payload) => api.post("/orders", payload),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status })
};

export default orderApi;
