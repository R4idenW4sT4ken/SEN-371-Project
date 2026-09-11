import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Truck, ArrowRight } from "lucide-react";
import cartApi from "../api/cartApi.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getStoredToken } from "../utils/auth.js";
import { formatPrice } from "../utils/format.js";
import ProductImage from "../components/ProductImage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;
const VAT_RATE = 0.15;

export default function Cart() {
  useDocumentTitle("Cart");
  const { notify } = useToast();
  const { refresh } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadCart = useCallback(async () => {
    try {
      const response = await cartApi.get();
      setCart(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (productId, delta) => {
    const item = cart.items.find((entry) => entry.product._id === productId);
    const next = item.quantity + delta;
    if (next < 1 || next > item.product.stock) return;

    setBusyId(productId);
    try {
      const response = await cartApi.updateItem(productId, next);
      setCart(response.data);
      refresh();
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Unable to update quantity.", "error");
    } finally {
      setBusyId("");
    }
  };

  const removeFromCart = async (productId) => {
    setBusyId(productId);
    try {
      const response = await cartApi.removeItem(productId);
      setCart(response.data);
      refresh();
      notify("Item removed from cart.", "info");
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Unable to remove item.", "error");
    } finally {
      setBusyId("");
    }
  };

  if (!getStoredToken()) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is waiting for you"
        copy="Log in to view the items you've added and continue to checkout."
        action={<Link className="btn btn-primary" to="/login">Log in</Link>}
      />
    );
  }

  if (loading) {
    return (
      <div className="main">
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-sub">Review the items in your cart before checking out.</p>
        <div className="cart-list">
          {[1, 2].map((item) => (
            <div key={item} className="cart-item">
              <div className="skeleton" style={{ width: 96, height: 96, borderRadius: 16 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="skeleton line-skeleton" style={{ width: "55%" }} />
                <div className="skeleton line-skeleton" style={{ width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((total, item) => total + (Number(item.product?.price) || 0) * item.quantity, 0);
  const shippingFee = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * VAT_RATE;
  const total = subtotal + shippingFee + tax;

  return (
    <div className="main">
      <h1 className="page-title">Shopping Cart</h1>
      <p className="page-sub">{items.length} item(s) · {formatPrice(subtotal)}</p>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          copy="Browse the catalogue and add something you love — free shipping over R 500.00."
          action={<Link className="btn btn-primary" to="/">Start shopping</Link>}
        />
      ) : (
        <div className="page-shell">
          <div className="cart-list">
            {items.map((item) => {
              const product = item.product;
              return (
                <article key={product._id} className="cart-item">
                  <Link to={`/products/${product._id}`} className="cart-media" aria-label={`View ${product.name}`}>
                    <ProductImage product={product} alt={product.name} />
                  </Link>

                  <div>
                    <h3 className="cart-item-name">
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </h3>
                    <p className="cart-item-meta">{product.category?.name || "General"} · {formatPrice(product.price)} each</p>

                    <div className="cart-item-foot">
                      <div className="qty-stepper">
                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(product._id, -1)} disabled={item.quantity <= 1 || busyId === product._id}>
                          −
                        </button>
                        <input type="number" value={item.quantity} readOnly aria-label="Quantity" />
                        <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(product._id, 1)} disabled={item.quantity >= product.stock || busyId === product._id}>
                          +
                        </button>
                      </div>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(product._id)}>
                        <Trash2 /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-right">
                    <span className="cart-line-total">{formatPrice(product.price * item.quantity)}</span>
                    {item.quantity >= product.stock && (
                      <span className="badge badge-low">Max stock</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="order-summary">
            <h3>Order summary</h3>
            <div className="summary-row"><span>Subtotal ({items.length} item(s))</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="summary-row"><span>Shipping</span><strong>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</strong></div>
            <div className="summary-row"><span>VAT (15%)</span><strong>{formatPrice(tax)}</strong></div>
            <div className="summary-divider" />
            <div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
            <Link className="btn btn-primary btn-block btn-lg" to="/checkout">
              Proceed to checkout <ArrowRight />
            </Link>
            {shippingFee === 0 && subtotal > 0 ? (
              <div className="free-ship-note"><Truck /> You've unlocked free shipping!</div>
            ) : (
              <div className="free-ship-note"><Truck /> Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}</div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}