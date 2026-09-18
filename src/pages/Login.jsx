import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@foodorder.com", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--mango)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            SR
          </div>
          <div>
            <h1 style={{ fontSize: 20 }}>Spice Rail</h1>
            <div style={{ fontSize: 12, color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Order Management
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 4 }}>Welcome back</h2>
        <p style={{ color: "var(--slate)", fontSize: 14, marginBottom: 24 }}>
          Sign in to manage today&rsquo;s orders and menu.
        </p>

        {error && (
          <div
            style={{
              background: "var(--chili-soft)",
              color: "var(--chili)",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 13.5,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="form-label-token">Email</label>
            <input
              className="form-control-token"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label-token">Password</label>
            <input
              className="form-control-token"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-mango" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 12.5, color: "var(--slate)", marginTop: 20, textAlign: "center" }}>
          Demo: <span className="mono">admin@foodorder.com</span> / <span className="mono">admin123</span>
         
        </p>
      </div>
    </div>
  );
};

export default Login;
