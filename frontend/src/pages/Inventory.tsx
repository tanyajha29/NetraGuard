import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const statusClass = (s: string) => {
  if (s === "zombie") return "danger";
  if (s === "shadow" || s === "deprecated") return "warning";
  return "success";
};

const Inventory = () => {
  const [assets, setAssets] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/v1/inventory").then((res) => setAssets(res.data));
  }, []);
  return (
    <div className="page">
      <div className="card">
        <h3>API Inventory</h3>
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
            {assets.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link to={`/inventory/${a.id}`}>{a.path}</Link>
                </td>
                <td>{a.method}</td>
                <td>
                  <span className={`badge ${statusClass(a.current_status)}`}>{a.current_status}</span>
                </td>
                <td>{a.risk_level}</td>
                <td>{a.traffic_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
