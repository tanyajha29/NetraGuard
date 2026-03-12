import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const nav = useNavigate();
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ full_name, email, password });
      nav("/dashboard");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: "80px auto" }}>
      <div className="card">
        <h2>Create account</h2>
        {error && <div className="badge danger">{error}</div>}
        <form onSubmit={submit} className="grid">
          <input placeholder="Full name" value={full_name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Register</button>
        </form>
        <p style={{ color: "var(--muted)" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
