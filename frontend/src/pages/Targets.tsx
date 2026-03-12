import { useEffect, useState } from "react";
import axios from "axios";

const Targets = () => {
  const [targets, setTargets] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", base_url: "", environment: "", owner: "" });

  const load = () => axios.get("/api/v1/targets").then((res) => setTargets(res.data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post("/api/v1/targets", form);
    setForm({ name: "", base_url: "", environment: "", owner: "" });
    load();
  };

  const startScan = async (id: number) => {
    await axios.post("/api/v1/scans/start", { target_id: id, trigger_type: "manual", log_file: "logs_test1.json" });
    alert("Scan dispatched");
  };

  return (
    <div className="page">
      <div className="card">
        <h3>Register Target</h3>
        <form onSubmit={submit} className="grid two">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Base URL" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} />
          <input placeholder="Environment" value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} />
          <input placeholder="Owner" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
          <button type="submit">Save</button>
        </form>
      </div>
      <div className="card">
        <h3>Targets</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Base URL</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.base_url}</td>
                <td>{t.owner ?? "—"}</td>
                <td>
                  <button onClick={() => startScan(t.id)}>Start scan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Targets;
