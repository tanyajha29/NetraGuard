import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { StatusBadge } from "../components/StatusBadge";
import { RiskBadge } from "../components/RiskBadge";
import { apiRequest } from "../lib/api";
import { APIAsset } from "../types";

const InventoryPage = () => {
  const [items, setItems] = useState<APIAsset[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const navigate = useNavigate();

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    if (risk) params.append("risk_level", risk);
    apiRequest<APIAsset[]>(`/api/v1/inventory?${params.toString()}`)
      .then(setItems)
      .catch(() => setItems([]));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, risk]);

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((i) => i.path.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return (
    <Layout title="API Inventory">
      <div className="card">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <input className="input" placeholder="Search path" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="shadow">Shadow</option>
            <option value="zombie">Zombie</option>
            <option value="deprecated">Deprecated</option>
            <option value="orphaned">Orphaned</option>
          </select>
          <select className="input" value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="">Risk</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="button secondary" onClick={load}>
            Refresh
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Path</th>
              <th>Method</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Traffic</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/inventory/${item.id}`)}>
                <td>{item.path}</td>
                <td>{item.method}</td>
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
    </Layout>
  );
};

export default InventoryPage;
