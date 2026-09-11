import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Wallet, Banknote, Truck, MapPin, ArrowRight, ShoppingCart, Lock } from "lucide-react";
import orderApi from "../api/orderApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { getStoredToken } from "../utils/auth.js";
import { formatPrice } from "../utils/format.js";
import ProductImage from "../components/ProductImage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 60;
const VAT_RATE = 0.15;

const PAYMENT_METHODS = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "paypal", label: "PayPal", icon: Wallet },
  { value: "cod", label: "Cash on delivery", icon: Banknote }
];

const initialAddress = { street: "", city: "", postalCode: "", country: "" };

export default function Checkout() {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const { notify } = useToast();
  const { items, count, subtotal, refresh } = useCart();

  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const shippingFee = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * VAT_RATE;
  const total = subtotal + shippingFee + tax;

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await orderApi.create({ shippingAddress, paymentMethod });
      notify("Order placed successfully!");
      navigate("/orders");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateAddress = (field) => (event) => {
    setShippingAddress({ ...shippingAddress, [field]: event.target.value });
  };

  if (!getStoredToken()) {
    return (
      <EmptyState
        icon={Lock}
        title="Log in to checkout"
        copy="You need an account to place an order."
        action={<Link className="btn btn-primary" to="/login">Log in</Link>}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        copy="Add some products before heading to checkout."
        action={<Link className="btn btn-primary" to="/">Browse products</Link>}
      />
    );
  }

  return (
    <div className="main">
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">Almost there — confirm your details and place your order.</p>

      <form onSubmit={submitOrder}>
        <div className="checkout-grid">
          <div>
            <section className="form-card">
              <h2><MapPin /> Shipping address</h2>
              <p className="form-hint">Where should we deliver your order?</p>

              <div className="field" style={{ marginBottom: 16 }}>
                <span>Street address</span>
                <input
                  required
                  placeholder="e.g. 12 Long Street"
                  value={shippingAddress.street}
                  onChange={updateAddress("street")}
                />
              </div>

              <div className="field-group">
                <div className="field">
                  <span>City</span>
                  <input required placeholder="e.g. Cape Town" value={shippingAddress.city} onChange={updateAddress("city")} />
                </div>
                <div className="field">
                  <span>Postal code</span>
                  <input required placeholder="e.g. 8001" value={shippingAddress.postalCode} onChange={updateAddress("postalCode")} />
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <span>Country</span>
                <input required placeholder="e.g. South Africa" value={shippingAddress.country} onChange={updateAddress("country")} />
              </div>
            </section>

            <section className="form-card">
              <h2>Payment method</h2>
              <p className="form-hint">Choose how you'd like to pay.</p>

              <div className="payment-options" role="radiogroup" aria-label="Payment method">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={paymentMethod === value}
                    className={`payment-option${paymentMethod === value ? " selected" : ""}`}
                    onClick={() => setPaymentMethod(value)}
                  >
                    <Icon />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="order-summary">
            <h3>Your order ({count} item(s))</h3>

            <div className="checkout-items">
              {items.map((item) => (
                <div key={item.product._id} className="checkout-item">
                  <div className="checkout-thumb">
                    <ProductImage product={item.product} alt={item.product.name} />
                  </div>
                  <div className="checkout-item-meta">
                    <div className="checkout-item-name">{item.product.name}</div>
                    <div className="checkout-item-qty">Qty {item.quantity}</div>
                  </div>
                  <span className="checkout-item-price">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="summary-row"><span>Shipping</span><strong>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</strong></div>
            <div className="summary-row"><span>VAT (15%)</span><strong>{formatPrice(tax)}</strong></div>
            <div className="summary-divider" />
            <div className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>

            {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting ? "Placing order…" : <>Place order <ArrowRight /></>}
            </button>

            <div className="free-ship-note"><Truck /> {shippingFee === 0 ? "Free shipping applied" : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping`}</div>
          </aside>
        </div>
      </form>
    </div>
  );
}