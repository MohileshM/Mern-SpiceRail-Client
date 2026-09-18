import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus, LuMinus, LuTrash2 } from "react-icons/lu";
import api from "../api/axios";

const categories = ["All", "Starters", "Main Course", "Beverages", "Desserts", "Fast Food", "Combos"];

const NewOrder = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({}); // { menuItemId: { ...item, quantity } }
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/menu", { params: { category: activeCategory === "All" ? undefined : activeCategory } })
      .then(({ data }) => setMenuItems(data.filter((i) => i.available)))
      .catch((err) => console.error(err));
  }, [activeCategory]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item._id];
      return {
        ...prev,
        [item._id]: {
          menuItem: item._id,
          name: item.name,
          price: item.price,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...existing, quantity: newQty } };
    });
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const cartItems = Object.values(cart);
  const total = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  const handleSubmit = async () => {
    setError("");
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/orders", {
        customerName,
        customerPhone,
        orderType,
        tableNumber,
        paymentMethod,
        notes,
        items: cartItems,
      });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="eyebrow">New ticket</div>
          <h1>Build an order</h1>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {categories.map((c) => (
              <span
                key={c}
                className={`chip ${activeCategory === c ? "active" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="row g-3">
            {menuItems.map((item) => (
              <div className="col-sm-6 col-xl-4" key={item._id}>
                <div className="menu-card" style={{ cursor: "pointer" }} onClick={() => addToCart(item)}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="menu-emoji">{item.image || "🍽️"}</div>
                    <button className="btn btn-sm btn-light border-0" title="Add">
                      <LuPlus size={15} />
                    </button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{item.name}</div>
                    <div className="chip" style={{ marginTop: 4 }}>{item.category}</div>
                  </div>
                  <span className="mono" style={{ fontWeight: 700 }}>₹{item.price}</span>
                </div>
              </div>
            ))}
            {menuItems.length === 0 && (
              <div className="empty-state">No available items in this category.</div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="ticket" style={{ position: "sticky", top: 20 }}>
            <div className="ticket-head">
              <div className="ticket-order-no">New order ticket</div>
              <span className="badge-status status-Pending">Draft</span>
            </div>
            <div className="ticket-perf" />
            <div className="ticket-body">
              {error && (
                <div style={{ background: "var(--chili-soft)", color: "var(--chili)", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <div className="row g-2 mb-2">
                <div className="col-7">
                  <label className="form-label-token">Customer name</label>
                  <input className="form-control-token" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="col-5">
                  <label className="form-label-token">Phone</label>
                  <input className="form-control-token" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label-token">Order type</label>
                  <select className="form-control-token" value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                    <option>Dine-In</option>
                    <option>Takeaway</option>
                    <option>Delivery</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label-token">{orderType === "Dine-In" ? "Table no." : "Payment method"}</label>
                  {orderType === "Dine-In" ? (
                    <input className="form-control-token" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
                  ) : (
                    <select className="form-control-token" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                      <option>Online</option>
                    </select>
                  )}
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 10px" }}>
                  Tap a dish to add it to this ticket.
                </div>
              ) : (
                cartItems.map((it) => (
                  <div className="ticket-item-row" key={it.menuItem}>
                    <span>{it.name}</span>
                    <span className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-light border-0 p-1" onClick={() => changeQty(it.menuItem, -1)}>
                        <LuMinus size={12} />
                      </button>
                      <span className="mono" style={{ minWidth: 16, textAlign: "center" }}>{it.quantity}</span>
                      <button className="btn btn-sm btn-light border-0 p-1" onClick={() => changeQty(it.menuItem, 1)}>
                        <LuPlus size={12} />
                      </button>
                      <span className="mono" style={{ minWidth: 50, textAlign: "right" }}>₹{it.price * it.quantity}</span>
                      <button className="btn btn-sm btn-light border-0 p-1" onClick={() => removeItem(it.menuItem)}>
                        <LuTrash2 size={12} color="var(--chili)" />
                      </button>
                    </span>
                  </div>
                ))
              )}

              <div
                className="d-flex justify-content-between align-items-center"
                style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}
              >
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="mono" style={{ fontWeight: 700, fontSize: 18 }}>₹{total}</span>
              </div>

              <button
                className="btn-mango w-100 mt-3"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
