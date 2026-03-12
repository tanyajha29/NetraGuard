import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ApiDetail = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<any | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/v1/inventory/${id}`).then((res) => setAsset(res.data));
    axios.get("/api/v1/findings").then((res) => setFindings(res.data.filter((f: any) => f.api_asset_id === Number(id))));
    axios.get("/api/v1/alerts").then((res) => setAlerts(res.data.filter((f: any) => f.api_asset_id === Number(id))));
  }, [id]);

  if (!asset) return <div className="page">Loading...</div>;

  return (
    <div className="page grid two">
      <div className="card">
        <h3>{asset.path}</h3>
        <p>Method: {asset.method}</p>
        <p>Status: {asset.current_status}</p>
        <p>Risk: {asset.risk_level}</p>
        <p>Recommendation: {asset.recommendation}</p>
      </div>
      <div className="card">
        <h3>Findings</h3>
        {findings.map((f) => (
          <div key={f.id} className="pill">
            <span className="badge danger">{f.severity}</span>
            {f.title}
          </div>
        ))}
        {!findings.length && <div className="badge neutral">No findings</div>}
        <h3>Alerts</h3>
        {alerts.map((f) => (
          <div key={f.id} className="pill">
            <span className="badge warning">{f.severity}</span>
            {f.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDetail;
