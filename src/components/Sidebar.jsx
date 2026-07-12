import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

const navItems = [
  { to: "/dashboard", label: "Home", icon: "home", end: true },
  { to: "/dashboard/tasks", label: "Tasks", icon: "task_alt" },
];

const adminItems = [
  { to: "/dashboard/employees", label: "Employees", icon: "groups" },
];

export default function Sidebar({ open, onClose }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavClick = () => {
    onClose();
  };

  const initials = (profile?.display_name || user?.user_metadata?.display_name || user?.email || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={logo} alt="TaskFlow" className="brand-logo" />
          <div className="brand-text-group">
            <span className="brand-text">TaskFlow</span>
            <span className="brand-badge">PRO</span>
          </div>
        </div>

        <div className="sidebar-section-label">Menu</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <span className="sidebar-link-icon">
                <span className="material-icons-round">{item.icon}</span>
              </span>
              <span className="sidebar-link-text">{item.label}</span>
              <span className="sidebar-link-glow" />
            </NavLink>
          ))}

          {isAdmin && adminItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <span className="sidebar-link-icon">
                <span className="material-icons-round">{item.icon}</span>
              </span>
              <span className="sidebar-link-text">{item.label}</span>
              <span className="sidebar-link-glow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-section-label" style={{ marginTop: 32 }}>Settings</div>
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="sidebar-link-icon">
              <span className="material-icons-round">settings</span>
            </span>
            <span className="sidebar-link-text">Settings</span>
            <span className="sidebar-link-glow" />
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0]}
            </span>
            <span className="sidebar-user-role">
              <span className={`role-badge role-badge-sm ${isAdmin ? "role-admin" : "role-employee"}`}>
                {isAdmin ? "Admin" : "Employee"}
              </span>
            </span>
          </div>
          <span className="material-icons-round sidebar-user-more">more_horiz</span>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          <span className="material-icons-round">logout</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
