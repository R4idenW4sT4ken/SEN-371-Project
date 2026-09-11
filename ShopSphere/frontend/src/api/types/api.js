export const apiRoutes = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me"
  },
  products: {
    base: "/products",
    byId: (id) => `/products/${id}`
  },
  categories: {
    base: "/categories"
  },
  cart: {
    base: "/cart",
    items: "/cart/items",
    itemByProduct: (productId) => `/cart/items/${productId}`
  },
  orders: {
    base: "/orders",
    byId: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`
  },
  reviews: {
    byProduct: (productId) => `/reviews/product/${productId}`,
    byId: (id) => `/reviews/${id}`
  }
};

export default apiRoutes;
