import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { apiRequest } from "../lib/api";
import { Workflow } from "../types";

const statusOptions = ["pending_review", "approved", "rejected", "demo_auto_disabled", "completed"];

const WorkflowsPage = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => apiRequest<Workflow[]>("/api/v1/workflows").then(setWorkflows).catch(() => setWorkflows([]));

  useEffect(() => {
    load();
  }, []);

  const update = async (wf: Workflow, status: string) => {
    setUpdating(wf.id);
    await apiRequest<Workflow>(`/api/v1/workflows/${wf.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        api_asset_id: wf.api_asset_id,
        scan_run_id: wf.scan_run_id,
        workflow_status: status,
        mode: wf.mode,
        notes: wf.notes,
        action_taken: wf.action_taken,
      }),
    });
    setUpdating(null);
    load();
  };

  return (
    <Layout title="Decommission Workflows">
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>API Asset</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((wf) => (
              <tr key={wf.id}>
                <td>{wf.id}</td>
                <td>{wf.api_asset_id}</td>
                <td>{wf.workflow_status}</td>
                <td>{wf.mode}</td>
                <td>
                  <select
                    className="input"
                    value={wf.workflow_status}
                    onChange={(e) => update(wf, e.target.value)}
                    disabled={updating === wf.id}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default WorkflowsPage;
