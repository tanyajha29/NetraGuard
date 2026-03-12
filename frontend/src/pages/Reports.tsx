import { useEffect, useState } from "react";
import axios from "axios";

const Reports = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/v1/reports").then((res) => setRows(res.data));
  }, []);
  return (
    <div className="page">
      <div className="card">
        <h3>Reports</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Target</th>
              <th>Generated</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.target_id}</td>
                <td>{r.generated_at ?? r.created_at}</td>
                <td>
                  <a href={`/api/v1/reports/${r.id}/download`} target="_blank" rel="noreferrer">
                    download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
