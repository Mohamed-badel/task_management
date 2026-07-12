import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { displayName, email, phone, user, initials } = useProfile();
  const { profile } = useAuth();

  const createdAt = user?.created_at;
  const role = profile?.role || "employee";

  return (
    <div className="page-profile">
      <div className="profile-header-card">
        <div className="profile-header-bg" />
        <div className="profile-header-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-avatar-ring" />
            <div className="profile-status-dot" />
          </div>
          <div className="profile-header-info">
            <h1 className="profile-name">{displayName || "—"}</h1>
            <p className="profile-email">{email}</p>
            <div className="profile-tags">
              <span className="profile-tag profile-tag-active">
                <span className="material-icons-round">verified</span>
                Active
              </span>
              <span className={`role-badge ${role === "admin" ? "role-admin" : "role-employee"}`}>
                <span className="material-icons-round">
                  {role === "admin" ? "admin_panel_settings" : "badge"}
                </span>
                {role === "admin" ? "Admin" : "Employee"}
              </span>
              <span className="profile-tag">
                <span className="material-icons-round">calendar_today</span>
                Joined{" "}
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-info-card">
          <div className="profile-info-card-header">
            <span className="material-icons-round profile-info-card-icon">person</span>
            <h3 className="profile-info-card-title">Personal Information</h3>
          </div>
          <div className="profile-info-card-body">
            <div className="profile-field">
              <span className="profile-field-label">Display Name</span>
              <span className="profile-field-value">{displayName || "—"}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Email Address</span>
              <span className="profile-field-value">{email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Phone Number</span>
              <span className="profile-field-value">{phone || "—"}</span>
            </div>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="profile-info-card-header">
            <span className="material-icons-round profile-info-card-icon">shield</span>
            <h3 className="profile-info-card-title">Account Details</h3>
          </div>
          <div className="profile-info-card-body">
            <div className="profile-field">
              <span className="profile-field-label">User ID</span>
              <span className="profile-field-value profile-field-mono">{user?.id || "—"}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Role</span>
              <span className="profile-field-value">
                <span className={`role-badge ${role === "admin" ? "role-admin" : "role-employee"}`}>
                  <span className="material-icons-round">
                    {role === "admin" ? "admin_panel_settings" : "badge"}
                  </span>
                  {role === "admin" ? "Admin" : "Employee"}
                </span>
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Last Sign In</span>
              <span className="profile-field-value">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
