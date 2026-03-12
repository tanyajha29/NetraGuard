import { useEffect, useState } from "react";
import axios from "axios";

const Workflows = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/v1/workflows").then((res) => setRows(res.data));
  }, []);
  return (
    <div className="page">
      <div className="card">
        <h3>Decommission Workflows</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Mode</th>
              <th>API Asset</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.workflow_status}</td>
                <td>{r.mode}</td>
                <td>{r.api_asset_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Workflows;
