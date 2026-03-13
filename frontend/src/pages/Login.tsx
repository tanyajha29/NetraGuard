import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("analyst@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, navigate);
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="content" style={{ maxWidth: 420, margin: "60px auto" }}>
      <div className="page">
        <h2>Login</h2>
        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div style={{ color: "var(--danger)" }}>{error}</div>}
          <button className="button" type="submit">
            Sign in
          </button>
        </form>
        <div style={{ marginTop: 10, color: "var(--muted)" }}>
          Need an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
