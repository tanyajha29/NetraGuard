import { useEffect, useState } from "react";
import axios from "axios";

const Alerts = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/v1/alerts").then((res) => setRows(res.data));
  }, []);
  return (
    <div className="page">
      <div className="card">
        <h3>Alerts</h3>
        {rows.map((r) => (
          <div key={r.id} className="pill">
            <span className="badge warning">{r.severity}</span>
            {r.message}
          </div>
        ))}
        {!rows.length && <div className="badge neutral">No alerts</div>}
      </div>
    </div>
  );
};

export default Alerts;
