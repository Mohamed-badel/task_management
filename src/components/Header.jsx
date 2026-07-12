import { useAuth } from "../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { user } = useAuth();

  const initials = (user?.user_metadata?.display_name || user?.email || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick}>
          <span className="material-icons-round">menu</span>
        </button>
        <div className="header-search">
          <span className="material-icons-round header-search-icon">search</span>
          <input type="text" placeholder="Search anything..." className="header-search-input" />
          <span className="header-search-shortcut">Ctrl K</span>
        </div>
      </div>
      <div className="header-right">

        <div className="header-divider" />
        <div className="header-user">
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
            </span>
            <span className="header-email">{user?.email}</span>
          </div>
          <span className="material-icons-round header-user-chevron">expand_more</span>
        </div>
      </div>
    </header>
  );
}
