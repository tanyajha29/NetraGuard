import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { apiRequest, API_URL } from "../lib/api";
import { Report } from "../types";

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    apiRequest<Report[]>("/api/v1/reports").then(setReports).catch(() => setReports([]));
  }, []);

  return (
    <Layout title="Reports">
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Target</th>
              <th>Created</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.target_id}</td>
                <td>{r.generated_at || r.summary}</td>
                <td>
                  <a className="button secondary" href={`${API_URL}/api/v1/reports/${r.id}/download`} target="_blank" rel="noreferrer">
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ReportsPage;
