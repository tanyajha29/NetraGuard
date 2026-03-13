import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { apiRequest } from "../lib/api";
import { Alert } from "../types";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [status, setStatus] = useState("");

  const load = () => {
    const qs = status ? `?status=${status}` : "";
    apiRequest<Alert[]>(`/api/v1/alerts${qs}`).then(setAlerts).catch(() => setAlerts([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Layout title="Alerts">
      <div className="card">
        <div className="title-row" style={{ marginBottom: 8 }}>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
          <button className="button secondary" onClick={load}>
            Refresh
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id}>
                <td>{a.alert_type}</td>
                <td>
                  <span className={`badge ${a.severity === "high" ? "red" : "amber"}`}>{a.severity}</span>
                </td>
                <td>{a.message}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AlertsPage;
