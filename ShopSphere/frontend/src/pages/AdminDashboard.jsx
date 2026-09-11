import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageOpen, Banknote, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import orderApi from "../api/orderApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { formatPrice, formatDateTime } from "../utils/format.js";
import EmptyState from "../components/EmptyState.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const statuses = ["pending", "processing", "shipped", "completed", "cancelled"];

function statusSelectClass(status) {
  return `status-select sel-${status}`;
}

export default function AdminDashboard() {
  useDocumentTitle("Admin Dashboard");
  const { isAdmin } = useAuth();
  const { notify } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderApi.getAllForAdmin();
      setOrders(response.data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load admin orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadOrders();
  }, [isAdmin, loadOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await orderApi.updateStatus(orderId, status);
      setOrders((current) => current.map((order) => (order._id === orderId ? response.data : order)));
      notify(`Order ${response.data.orderNumber} → ${status}.`, "info");
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Unable to update order status.", "error");
    }
  };

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Administrator access required"
        copy="You don't have permission to view the admin dashboard."
        action={<Link className="btn btn-primary" to="/">Back to shop</Link>}
      />
    );
  }

  if (loading) {
    return (
      <div className="main">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="admin-stats">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="stat-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="skeleton line-skeleton" style={{ width: 80 }} />
                <div className="skeleton line-skeleton" style={{ width: 50, height: 22 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="admin-table-wrap">
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-400)" }}>Loading orders…</div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const completedCount = orders.filter((order) => order.status === "completed").length;

  return (
    <div className="main">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Manage orders and keep fulfilment on track.</p>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="icon-tile brand"><PackageOpen /></div>
          <div>
            <div className="stat-label">Total orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-tile green"><Banknote /></div>
          <div>
            <div className="stat-label">Revenue</div>
            <div className="stat-value">{formatPrice(totalRevenue)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-tile amber"><Clock /></div>
          <div>
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon-tile sky"><CheckCircle2 /></div>
          <div>
            <div className="stat-label">Completed</div>
            <div className="stat-value">{completedCount}</div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {orders.length === 0 && !error ? (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          copy="Customer orders will appear here once they check out."
        />
      ) : orders.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="cell-strong">{order.orderNumber}</td>
                  <td>
                    {order.owner?.name || "—"}
                    {order.owner?.email && (
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-400)" }}>{order.owner.email}</div>
                    )}
                  </td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td className="cell-strong">{formatPrice(order.total)}</td>
                  <td>
                    <select
                      className={statusSelectClass(order.status)}
                      value={order.status}
                      onChange={(event) => updateStatus(order._id, event.target.value)}
                      aria-label={`Status for ${order.orderNumber}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}