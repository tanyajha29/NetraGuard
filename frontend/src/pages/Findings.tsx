import { useEffect, useState } from "react";
import axios from "axios";

const Findings = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    axios.get("/api/v1/findings").then((res) => setRows(res.data));
  }, []);
  return (
    <div className="page">
      <div className="card">
        <h3>Findings</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.finding_type}</td>
                <td>
                  <span className={`badge ${r.severity === "high" ? "danger" : "warning"}`}>{r.severity}</span>
                </td>
                <td>{r.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Findings;
