import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/targets", label: "Targets" },
  { to: "/inventory", label: "Inventory" },
  { to: "/findings", label: "Findings" },
  { to: "/alerts", label: "Alerts" },
  { to: "/reports", label: "Reports" },
  { to: "/workflows", label: "Workflows" }
];

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="brand">NetraGuard</div>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "nav active" : "nav")}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
