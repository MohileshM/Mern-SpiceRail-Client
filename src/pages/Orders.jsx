import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const statuses = ["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"];
const nextStatusMap = {
  Pending: "Preparing",
  Preparing: "Ready",
  Ready: "Completed",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get("/orders", { params });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const advanceStatus = async (order) => {
    const next = nextStatusMap[order.status];
    if (!next) return;
    try {
      await api.patch(`/orders/${order._id}/status`, { status: next });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const cancelOrder = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    try {
      await api.patch(`/orders/${order._id}/status`, { status: "Cancelled" });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePayment = async (order) => {
    try {
      await api.patch(`/orders/${order._id}/payment`, {
        paymentStatus: order.paymentStatus === "Paid" ? "Unpaid" : "Paid",
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="eyebrow">Ticket rail</div>
          <h1>Orders</h1>
        </div>
        <Link to="/orders/new" className="btn-mango d-flex align-items-center gap-2">
          <LuPlus /> New order
        </Link>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        {statuses.map((s) => (
          <span
            key={s}
            className={`chip ${statusFilter === s ? "active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </span>
        ))}
        <input
          className="form-control-token ms-auto"
          style={{ maxWidth: 240 }}
          placeholder="Search order # or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders on the rail</h3>
          <p>New orders will appear here as tickets once placed.</p>
        </div>
      ) : (
        <div className="row g-3">
          {orders.map((order) => (
            <div className="col-md-6 col-xl-4" key={order._id}>
              <div className="ticket">
                <div className="ticket-head">
                  <div>
                    <div className="ticket-order-no">{order.orderNumber}</div>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>
                      {order.customerName} · {order.orderType}
                      {order.tableNumber ? ` · Table ${order.tableNumber}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="ticket-perf" />
                <div className="ticket-body">
                  {order.items.map((it, idx) => (
                    <div className="ticket-item-row" key={idx}>
                      <span><span className="qty">{it.quantity}×</span>{it.name}</span>
                      <span className="mono">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span
                      onClick={() => togglePayment(order)}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        color: order.paymentStatus === "Paid" ? "var(--basil)" : "var(--chili)",
                      }}
                      title="Click to toggle payment status"
                    >
                      {order.paymentStatus === "Paid" ? "✓ Paid" : "● Unpaid"} · {order.paymentMethod}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--slate)" }}>
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {!["Completed", "Cancelled"].includes(order.status) && (
                    <div className="d-flex gap-2 mt-3">
                      {nextStatusMap[order.status] && (
                        <button
                          className="btn-mango flex-fill"
                          style={{ fontSize: 13, padding: "7px 10px" }}
                          onClick={() => advanceStatus(order)}
                        >
                          Mark as {nextStatusMap[order.status]}
                        </button>
                      )}
                      <button
                        className="btn-outline-ink"
                        style={{ fontSize: 13, padding: "7px 12px" }}
                        onClick={() => cancelOrder(order)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
