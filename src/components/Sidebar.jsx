import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LuLayoutGrid, LuUtensils, LuReceipt, LuPlus, LuLogOut } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", icon: <LuLayoutGrid />, end: true },
  { to: "/orders", label: "Orders", icon: <LuReceipt /> },
  { to: "/orders/new", label: "New Order", icon: <LuPlus /> },
  { to: "/menu", label: "Menu", icon: <LuUtensils /> },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="mark">SR</div>
        <div>
          <div className="title">Spice Rail</div>
          <div className="subtitle">Order Management</div>
        </div>
      </div>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "0 8px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--mango)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              color: "var(--ink)",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--paper)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: "rgba(251,248,242,0.5)", textTransform: "capitalize" }}>{user?.role}</div>
          </div>
        </div>
        <div className="nav-item" onClick={handleLogout} style={{ cursor: "pointer" }}>
          <LuLogOut /> Sign out
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
