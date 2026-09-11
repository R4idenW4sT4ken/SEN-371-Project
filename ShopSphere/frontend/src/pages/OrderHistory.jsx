import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, Clock, Send, Truck, CheckCircle2, XCircle, Banknote, CreditCard, Wallet, MapPin, X } from "lucide-react";
import orderApi from "../api/orderApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { getStoredToken } from "../utils/auth.js";
import { formatPrice, formatDateTime } from "../utils/format.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const STATUS_META = {
  pending: { icon: Clock, label: "Pending" },
  processing: { icon: Send, label: "Processing" },
  shipped: { icon: Truck, label: "Shipped" },
  completed: { icon: CheckCircle2, label: "Completed" },
  cancelled: { icon: XCircle, label: "Cancelled" }
};

const PAYMENT_ICONS = { card: CreditCard, paypal: Wallet, cod: Banknote };

export default function OrderHistory() {
  const { notify } = useToast();
  useDocumentTitle("Order History");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pendingCancel, setPendingCancel] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderApi.getAll();
      setOrders(response.data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const requestCancel = (order) => {
    setPendingCancel(order);
  };

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    const orderId = pendingCancel._id;
    setBusyId(orderId);
    try {
      await orderApi.cancel(orderId);
      await loadOrders();
      notify("Order cancelled.", "info");
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Unable to cancel order.", "error");
    } finally {
      setBusyId("");
      setPendingCancel(null);
    }
  };

  if (!getStoredToken()) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="Log in to view your orders"
        copy="Track your deliveries and review past purchases from your account."
        action={<Link className="btn btn-primary" to="/login">Log in</Link>}
      />
    );
  }

  if (loading) {
    return (
      <div className="main">
        <h1 className="page-title">Order History</h1>
        <p className="page-sub">All your purchases in one place.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[1, 2].map((item) => (
            <div key={item} className="order-card">
              <div className="skeleton line-skeleton" style={{ width: "30%", height: 20, marginBottom: 16 }} />
              <div className="skeleton line-skeleton" style={{ width: "80%" }} />
              <div className="skeleton line-skeleton" style={{ width: "60%", marginTop: 10 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <h1 className="page-title">Order History</h1>
      <p className="page-sub">{orders.length} order(s) placed.</p>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {!error && orders.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          copy="Once you place an order, it will show up here with live status updates."
          action={<Link className="btn btn-primary" to="/">Start shopping</Link>}
        />
      )}

      {orders.map((order) => {
        const status = STATUS_META[order.status] || STATUS_META.pending;
        const StatusIcon = status.icon;
        const PaymentIcon = PAYMENT_ICONS[order.paymentMethod] || CreditCard;
        return (
          <article key={order._id} className="order-card">
            <div className="order-head">
              <div>
                <div className="order-number">{order.orderNumber}</div>
                <div className="order-date">Placed {formatDateTime(order.createdAt)}</div>
              </div>
              <span className={`status-badge status-${order.status}`}>
                <StatusIcon /> {status.label}
              </span>
            </div>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item._id || item.name + item.quantity} className="order-item-line">
                  <span>{item.quantity} × {item.name}</span>
                  <span>{formatPrice(item.total || item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="order-blocks">
              <div className="order-block">
                <h4>Deliver to</h4>
                <p style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <MapPin style={{ width: 15, height: 15, flex: "none", marginTop: 3 }} />
                  {order.shippingAddress?.street}, {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                </p>
              </div>
              <div className="order-block">
                <h4>Payment</h4>
                <p style={{ display: "flex", gap: 7, alignItems: "center" }}>
                  <PaymentIcon style={{ width: 15, height: 15 }} />
                  {order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod === "card" ? "Card" : "PayPal"}
                </p>
              </div>
            </div>

            <div className="order-foot">
              <div className="order-total">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              {order.status === "pending" && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busyId === order._id}
                  onClick={() => requestCancel(order)}
                >
                  <X /> Cancel order
                </button>
              )}
            </div>
          </article>
        );
      })}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this order?"
        description={pendingCancel ? `Order ${pendingCancel.orderNumber} will be cancelled. This can't be undone.` : ""}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        tone="danger"
        busy={busyId === pendingCancel?._id}
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}