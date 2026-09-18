import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import api from "../api/axios";

const categories = ["Starters", "Main Course", "Beverages", "Desserts", "Fast Food", "Combos"];
const emojiOptions = ["🍢", "🍗", "🍛", "🍲", "🍕", "🍔", "🥤", "🍋", "🍫", "🍮", "🍽️", "🥗", "🌮", "🍜"];

const emptyForm = { name: "", category: "Main Course", price: "", description: "", image: "🍽️", available: true };

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (search) params.search = search;
      const { data } = await api.get("/menu", { params });
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchItems, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image || "🍽️",
      available: item.available,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
      } else {
        await api.post("/menu", payload);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this item from the menu?")) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="eyebrow">Catalogue</div>
          <h1>Menu</h1>
        </div>
        <button className="btn-mango d-flex align-items-center gap-2" onClick={openCreate}>
          <LuPlus /> Add item
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <span
          className={`chip ${activeCategory === "All" ? "active" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => setActiveCategory("All")}
        >
          All
        </span>
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
        <input
          className="form-control-token ms-auto"
          style={{ maxWidth: 240 }}
          placeholder="Search menu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state">Loading menu…</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing here yet</h3>
          <p>Add your first dish to start building the menu.</p>
        </div>
      ) : (
        <div className="row g-3">
          {items.map((item) => (
            <div className="col-sm-6 col-lg-4 col-xl-3" key={item._id}>
              <div className="menu-card">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="menu-emoji">{item.image || "🍽️"}</div>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-light border-0"
                      title="Edit"
                      onClick={() => openEdit(item)}
                    >
                      <LuPencil size={15} />
                    </button>
                    <button
                      className="btn btn-sm btn-light border-0"
                      title="Delete"
                      onClick={() => handleDelete(item._id)}
                    >
                      <LuTrash2 size={15} color="var(--chili)" />
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                  <div className="chip" style={{ marginTop: 4 }}>{item.category}</div>
                </div>
                {item.description && (
                  <div style={{ fontSize: 12.5, color: "var(--slate)", minHeight: 32 }}>{item.description}</div>
                )}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>₹{item.price}</span>
                  {!item.available && (
                    <span className="badge-status status-Cancelled">Unavailable</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body style={{ padding: 28 }}>
          <h4 style={{ marginBottom: 18 }}>{editingId ? "Edit item" : "Add a new item"}</h4>
          {error && (
            <div style={{ background: "var(--chili-soft)", color: "var(--chili)", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-token">Dish name</label>
              <input
                className="form-control-token"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="row g-2 mb-3">
              <div className="col-7">
                <label className="form-label-token">Category</label>
                <select
                  className="form-control-token"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-5">
                <label className="form-label-token">Price (₹)</label>
                <input
                  className="form-control-token"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label-token">Description</label>
              <input
                className="form-control-token"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label-token">Icon</label>
              <div className="d-flex flex-wrap gap-2">
                {emojiOptions.map((em) => (
                  <span
                    key={em}
                    onClick={() => setForm({ ...form, image: em })}
                    style={{
                      fontSize: 20,
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: form.image === em ? "var(--mango)" : "var(--paper-dim)",
                    }}
                  >
                    {em}
                  </span>
                ))}
              </div>
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="available" style={{ fontSize: 14 }}>
                Available on the menu
              </label>
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn-outline-ink" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-mango">
                {editingId ? "Save changes" : "Add item"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Menu;
