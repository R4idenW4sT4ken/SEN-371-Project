import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import cartApi from "../api/cartApi.js";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!sessionStorage.getItem("shopsphere_token")) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await cartApi.get();
      setItems(response.data?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("shopsphere:authchange", refresh);
    return () => window.removeEventListener("shopsphere:authchange", refresh);
  }, [refresh]);

  const count = useMemo(
    () => items.reduce((total, item) => total + (item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + (Number(item.product?.price) || 0) * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, subtotal, loading, refresh, setItems }),
    [items, count, subtotal, loading, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}