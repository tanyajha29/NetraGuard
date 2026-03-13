import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { MetricCard } from "../components/MetricCard";
import { apiRequest } from "../lib/api";
import { APIAsset, Alert } from "../types";
import { RiskBadge } from "../components/RiskBadge";
import { StatusBadge } from "../components/StatusBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

const statusColors: Record<string, string> = {
  active: "#22c55e",
  zombie: "#ef4444",
  shadow: "#60a5fa",
  deprecated: "#f59e0b",
  orphaned: "#a855f7",
};

const DashboardPage = () => {
  const [inventory, setInventory] = useState<APIAsset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    apiRequest<APIAsset[]>("/api/v1/inventory").then(setInventory).catch(() => setInventory([]));
    apiRequest<Alert[]>("/api/v1/alerts").then(setAlerts).catch(() => setAlerts([]));
  }, []);

  const stats = useMemo(() => {
    const total = inventory.length;
    const active = inventory.filter((i) => i.current_status === "active").length;
    const zombie = inventory.filter((i) => i.current_status === "zombie").length;
    const shadow = inventory.filter((i) => i.current_status === "shadow").length;
    const deprecated = inventory.filter((i) => i.current_status === "deprecated").length;
    const highRisk = inventory.filter((i) => ["high", "critical"].includes(i.risk_level.toLowerCase())).length;
    return { total, active, zombie, shadow, deprecated, highRisk };
  }, [inventory]);

  const statusData = useMemo(
    () =>
      ["active", "shadow", "zombie", "deprecated", "orphaned"].map((s) => ({
        name: s,
        value: inventory.filter((i) => i.current_status === s).length,
      })),
    [inventory],
  );

  const riskData = useMemo(
    () =>
      ["Critical", "High", "Medium", "Low"].map((r) => ({
        name: r,
        value: inventory.filter((i) => i.risk_level?.toLowerCase() === r.toLowerCase()).length,
      })),
    [inventory],
  );

  return (
    <Layout title="Security Overview">
      <div className="grid four">
        <MetricCard title="Total APIs" value={stats.total} />
        <MetricCard title="Active" value={stats.active} tone="success" />
        <MetricCard title="Zombie" value={stats.zombie} tone="critical" />
        <MetricCard title="Shadow" value={stats.shadow} tone="warning" />
        <MetricCard title="Deprecated" value={stats.deprecated} tone="warning" />
        <MetricCard title="High Risk" value={stats.highRisk} tone="critical" />
      </div>

      <div className="grid" style={{ marginTop: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ height: 320 }}>
          <div className="title-row">
            <h3>Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" label>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || "#60a5fa"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ height: 320 }}>
          <div className="title-row">
            <h3>Risk Levels</h3>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={riskData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16, gridTemplateColumns: "2fr 1fr" }}>
        <div className="card">
          <div className="title-row">
            <h3>Recent Inventory</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Traffic</th>
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 8).map((item) => (
                <tr key={item.id}>
                  <td>{item.method}</td>
                  <td>{item.path}</td>
                  <td>
                    <StatusBadge status={item.current_status} />
                  </td>
                  <td>
                    <RiskBadge level={item.risk_level} />
                  </td>
                  <td>{item.traffic_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="title-row">
            <h3>Alerts</h3>
          </div>
          <div className="grid" style={{ gap: 10 }}>
            {alerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="page">
                <div style={{ fontWeight: 600 }}>{alert.message}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{alert.alert_type}</div>
                <div className="badge red" style={{ marginTop: 6 }}>
                  {alert.severity}
                </div>
              </div>
            ))}
            {!alerts.length && <div style={{ color: "var(--muted)" }}>No alerts yet.</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
