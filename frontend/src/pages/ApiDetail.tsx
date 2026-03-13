import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { StatusBadge } from "../components/StatusBadge";
import { RiskBadge } from "../components/RiskBadge";
import { apiRequest } from "../lib/api";
import { APIAsset, Alert, Finding } from "../types";

const ApiDetailPage = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<APIAsset | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!id) return;
    apiRequest<APIAsset>(`/api/v1/inventory/${id}`).then(setAsset);
    apiRequest<Finding[]>("/api/v1/findings").then((all) => setFindings(all.filter((f) => f.api_asset_id === Number(id))));
    apiRequest<Alert[]>("/api/v1/alerts").then((all) => setAlerts(all.filter((a) => a.api_asset_id === Number(id))));
  }, [id]);

  if (!asset) return <Layout title="API Detail">Loading...</Layout>;

  return (
    <Layout title={`${asset.method} ${asset.path}`}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <h3>Metadata</h3>
          <div>Target: {asset.target_id}</div>
          <div>Status: <StatusBadge status={asset.current_status} /></div>
          <div>Risk: <RiskBadge level={asset.risk_level} /></div>
          <div>Traffic: {asset.traffic_count}</div>
          <div>Auth required: {asset.auth_required ? "Yes" : "No"}</div>
          <div>HTTPS: {asset.encryption_enabled ? "Yes" : "No"}</div>
          <div>Rate limit: {asset.rate_limit_detected ? "Yes" : "No"}</div>
          <div>Source: {asset.source_type}</div>
          <div>Recommendation: {asset.recommendation || "—"}</div>
        </div>
        <div className="card">
          <h3>Security Findings</h3>
          <ul>
            {findings.map((f) => (
              <li key={f.id}>
                <strong>[{f.severity}]</strong> {f.title}
              </li>
            ))}
            {!findings.length && <li>None</li>}
          </ul>
          <h3 style={{ marginTop: 12 }}>Alerts</h3>
          <ul>
            {alerts.map((a) => (
              <li key={a.id}>
                <strong>[{a.severity}]</strong> {a.message}
              </li>
            ))}
            {!alerts.length && <li>None</li>}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ApiDetailPage;
