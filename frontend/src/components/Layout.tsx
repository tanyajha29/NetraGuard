import { Sidebar } from "./Sidebar";
import "./Layout.css";
import { useAuth } from "../hooks/useAuth";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <header className="topbar">
          <div className="top-title">API Security Control Plane</div>
          <div className="top-user">
            <span>{user?.full_name ?? "Analyst"}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </header>
        <div>{children}</div>
      </main>
    </div>
  );
};
