import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, active: 0, zombie: 0, shadow: 0, deprecated: 0 });
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/v1/inventory").then((res) => {
      const items = res.data;
      const total = items.length;
      const count = (status: string) => items.filter((i: any) => i.current_status === status).length;
      setStats({
        total,
        active: count("active"),
        zombie: count("zombie"),
        shadow: count("shadow"),
        deprecated: count("deprecated"),
      });
    });
    axios.get("/api/v1/alerts").then((res) => setAlerts(res.data.slice(0, 5)));
  }, []);

  const pieData = [
    { name: "Active", value: stats.active, color: "#48e9a4" },
    { name: "Zombie", value: stats.zombie, color: "#ff6b6b" },
    { name: "Shadow", value: stats.shadow, color: "#ffb347" },
    { name: "Deprecated", value: stats.deprecated, color: "#7cf0ff" },
  ];

  return (
    <div className="page grid two">
      <div className="card">
        <h3>Inventory Overview</h3>
        <div className="grid two">
          <div className="pill">Total APIs: {stats.total}</div>
          <div className="pill">Active: {stats.active}</div>
          <div className="pill">Shadow: {stats.shadow}</div>
          <div className="pill">Zombie: {stats.zombie}</div>
        </div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3>Recent Alerts</h3>
        {alerts.map((a) => (
          <div key={a.id} className="pill">
            <span className="badge danger">{a.severity}</span>
            {a.message}
          </div>
        ))}
        {!alerts.length && <div className="badge neutral">No alerts yet</div>}
      </div>
    </div>
  );
};

export default Dashboard;
