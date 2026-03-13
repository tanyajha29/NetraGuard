import { FormEvent, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { apiRequest } from "../lib/api";
import { Target } from "../types";

const TargetsPage = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [form, setForm] = useState<Partial<Target>>({ name: "", base_url: "" });
  const [scanTargetId, setScanTargetId] = useState<number | null>(null);
  const [logFile, setLogFile] = useState("logs_test1.json");
  const [message, setMessage] = useState("");

  const loadTargets = () => {
    apiRequest<Target[]>("/api/v1/targets").then(setTargets).catch(() => setTargets([]));
  };

  useEffect(() => {
    loadTargets();
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await apiRequest<Target>("/api/v1/targets", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", base_url: "" });
    loadTargets();
  };

  const startScan = async () => {
    if (!scanTargetId) return;
    setMessage("Starting scan...");
    await apiRequest("/api/v1/scans/start", {
      method: "POST",
      body: JSON.stringify({ target_id: scanTargetId, trigger_type: "manual", log_file: logFile }),
    });
    setMessage("Scan dispatched to Celery worker.");
  };

  return (
    <Layout title="Targets">
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div className="card">
          <h3>Registered Targets</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Base URL</th>
                <th>Environment</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.base_url}</td>
                  <td>{t.environment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>New Target</h3>
          <form className="grid" style={{ gap: 10 }} onSubmit={onCreate}>
            <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Base URL (http://mock_target:8100)" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
            <input className="input" placeholder="Environment (demo/prod)" value={form.environment || ""} onChange={(e) => setForm({ ...form, environment: e.target.value })} />
            <input className="input" placeholder="Owner" value={form.owner || ""} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <button className="button" type="submit">
              Save Target
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Start Scan</h3>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <select className="input" value={scanTargetId || ""} onChange={(e) => setScanTargetId(Number(e.target.value))}>
            <option value="">Select target</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select className="input" value={logFile} onChange={(e) => setLogFile(e.target.value)}>
            <option value="logs_test1.json">logs_test1.json</option>
            <option value="logs_test2.json">logs_test2.json</option>
            <option value="logs_test3.json">logs_test3.json</option>
            <option value="">(none)</option>
          </select>
          <button className="button" onClick={startScan} disabled={!scanTargetId}>
            Dispatch to Celery
          </button>
        </div>
        {message && <div style={{ marginTop: 8, color: "var(--muted)" }}>{message}</div>}
      </div>
    </Layout>
  );
};

export default TargetsPage;
