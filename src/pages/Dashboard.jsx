import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { LuReceipt, LuUtensils, LuIndianRupee, LuClock } from "react-icons/lu";
import api from "../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const statusColors = {
  Pending: "#f4a100",
  Preparing: "#2b5fc7",
  Ready: "#6b3fc4",
  Completed: "#2f8f5b",
  Cancelled: "#d64545",
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [byStatus, setByStatus] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [typeSplit, setTypeSplit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, rt, ti, ts] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/orders-by-status"),
          api.get("/dashboard/revenue-trend"),
          api.get("/dashboard/top-items"),
          api.get("/dashboard/order-type-split"),
        ]);
        setSummary(s.data);
        setByStatus(st.data);
        setRevenueTrend(rt.data);
        setTopItems(ti.data);
        setTypeSplit(ts.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: "Total Orders", value: summary?.totalOrders ?? "—", icon: <LuReceipt />, bg: "#fff3d9", color: "var(--mango-dark)" },
    { label: "Revenue", value: summary ? `₹${summary.totalRevenue.toLocaleString("en-IN")}` : "—", icon: <LuIndianRupee />, bg: "var(--basil-soft)", color: "var(--basil)" },
    { label: "Menu Items", value: summary?.totalMenuItems ?? "—", icon: <LuUtensils />, bg: "#eee6fc", color: "#6b3fc4" },
    { label: "In Progress", value: summary?.pendingOrders ?? "—", icon: <LuClock />, bg: "var(--chili-soft)", color: "var(--chili)" },
  ];

  const lineData = {
    labels: revenueTrend.map((r) =>
      new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })
    ),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueTrend.map((r) => r.revenue),
        borderColor: "#f4a100",
        backgroundColor: "rgba(244,161,0,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: "#f4a100",
      },
    ],
  };

  const doughnutData = {
    labels: byStatus.map((s) => s.status),
    datasets: [
      {
        data: byStatus.map((s) => s.count),
        backgroundColor: byStatus.map((s) => statusColors[s.status] || "#ccc"),
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: topItems.map((i) => i.name),
    datasets: [
      {
        label: "Times Ordered",
        data: topItems.map((i) => i.timesOrdered),
        backgroundColor: "#2f8f5b",
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const typeDonutData = {
    labels: typeSplit.map((t) => t.type),
    datasets: [
      {
        data: typeSplit.map((t) => t.count),
        backgroundColor: ["#f4a100", "#2b5fc7", "#6b3fc4"],
        borderWidth: 0,
      },
    ],
  };

  const commonOpts = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eee6d8" }, beginAtZero: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Today on the rail</h1>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? "…" : s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-8">
          <div className="card-surface p-3" style={{ height: 320 }}>
            <h4 style={{ fontSize: 15, marginBottom: 12 }}>Revenue — last 7 days</h4>
            <div style={{ height: 250 }}>
              {revenueTrend.length > 0 ? (
                <Line data={lineData} options={commonOpts} />
              ) : (
                <div className="empty-state">No revenue recorded yet this week.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-surface p-3" style={{ height: 320 }}>
            <h4 style={{ fontSize: 15, marginBottom: 12 }}>Orders by status</h4>
            <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {byStatus.length > 0 ? (
                <Doughnut
                  data={doughnutData}
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } } }}
                />
              ) : (
                <div className="empty-state">No orders yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-surface p-3" style={{ height: 300 }}>
            <h4 style={{ fontSize: 15, marginBottom: 12 }}>Top-selling items</h4>
            <div style={{ height: 230 }}>
              {topItems.some((i) => i.timesOrdered > 0) ? (
                <Bar data={barData} options={{ ...commonOpts, indexAxis: "y" }} />
              ) : (
                <div className="empty-state">Items will rank here once orders come in.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card-surface p-3" style={{ height: 300 }}>
            <h4 style={{ fontSize: 15, marginBottom: 12 }}>Order type split</h4>
            <div style={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {typeSplit.length > 0 ? (
                <Doughnut
                  data={typeDonutData}
                  options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } } }}
                />
              ) : (
                <div className="empty-state">No orders yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
