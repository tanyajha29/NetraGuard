import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("changeme");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 420, margin: "80px auto" }}>
      <div className="card">
        <h2>Sign in to NetraGuard</h2>
        {error && <div className="badge danger">{error}</div>}
        <form onSubmit={submit} className="grid">
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <p style={{ color: "var(--muted)" }}>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
