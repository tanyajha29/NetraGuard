import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { apiRequest } from "../lib/api";
import { Finding } from "../types";

const FindingsPage = () => {
  const [findings, setFindings] = useState<Finding[]>([]);

  useEffect(() => {
    apiRequest<Finding[]>("/api/v1/findings").then(setFindings).catch(() => setFindings([]));
  }, []);

  return (
    <Layout title="Findings">
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Title</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id}>
                <td>{f.finding_type}</td>
                <td>
                  <span className={`badge ${f.severity === "high" ? "red" : f.severity === "medium" ? "amber" : "blue"}`}>{f.severity}</span>
                </td>
                <td>{f.title}</td>
                <td>{f.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default FindingsPage;
