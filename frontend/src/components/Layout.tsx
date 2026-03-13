import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/targets", label: "Targets" },
  { to: "/inventory", label: "Inventory" },
  { to: "/findings", label: "Findings" },
  { to: "/alerts", label: "Alerts" },
  { to: "/reports", label: "Reports" },
  { to: "/workflows", label: "Workflows" },
];

export const Layout: React.FC<{ title?: string; actions?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  actions,
  children,
}) => {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>NetraGuard</h1>
        <div style={{ marginBottom: 12, color: "var(--muted)", fontSize: 13 }}>
          {user?.full_name} · {user?.role}
        </div>
        <div>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <button className="button secondary" style={{ marginTop: 20 }} onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="content">
        <div className="title-row">
          <div>
            <h2 style={{ margin: 0 }}>{title || " "}</h2>
          </div>
          <div>{actions}</div>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </main>
    </div>
  );
};
