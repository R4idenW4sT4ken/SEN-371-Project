import api from "../services/api.js";

export const categoryApi = {
  getAll: () => api.get("/categories"),
  create: (name) => api.post("/categories", { name })
};

export default categoryApi;
