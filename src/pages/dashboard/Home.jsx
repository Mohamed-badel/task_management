import { Link } from "react-router-dom";
import { useTasks } from "../../hooks/useTasks";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  pending: { color: "#d97706", bg: "rgba(245, 158, 11, 0.1)", label: "Pending" },
  in_progress: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)", label: "In Progress" },
  done: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", label: "Done" },
};

export default function Home() {
  const { tasks, loading, stats } = useTasks();
  const { displayName } = useProfile();
  const { isAdmin } = useAuth();

  const recentTasks = tasks.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-home">
      <div className="home-welcome">
        <div className="home-welcome-content">
          <h1 className="home-welcome-title">
            {greeting}, {displayName || "there"}
          </h1>
          <p className="home-welcome-subtitle">
            Here's what's happening with your tasks today.
          </p>
          <div className="home-welcome-actions">
            {isAdmin && (
              <span className="role-badge role-admin" style={{ marginRight: 8 }}>
                <span className="material-icons-round">admin_panel_settings</span>
                Admin
              </span>
            )}
            <Link to="/dashboard/tasks" className="home-welcome-btn">
              <span className="material-icons-round">add_task</span>
              View All Tasks
            </Link>
          </div>
        </div>
        <div className="home-welcome-illustration">
          <div className="home-welcome-circle home-welcome-circle-1" />
          <div className="home-welcome-circle home-welcome-circle-2" />
          <div className="home-welcome-circle home-welcome-circle-3" />
          <span className="material-icons-round home-welcome-icon">dashboard</span>
        </div>
      </div>

      <div className="home-stats-grid">
        <div className="home-stat-card">
          <div className="home-stat-icon home-stat-icon-total">
            <span className="material-icons-round">inventory_2</span>
          </div>
          <div className="home-stat-info">
            <span className="home-stat-number">{stats.total}</span>
            <span className="home-stat-label">Total Tasks</span>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon home-stat-icon-progress">
            <span className="material-icons-round">autorenew</span>
          </div>
          <div className="home-stat-info">
            <span className="home-stat-number">{stats.inProgress}</span>
            <span className="home-stat-label">In Progress</span>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon home-stat-icon-pending">
            <span className="material-icons-round">schedule</span>
          </div>
          <div className="home-stat-info">
            <span className="home-stat-number">{stats.pending}</span>
            <span className="home-stat-label">Pending</span>
          </div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon home-stat-icon-done">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div className="home-stat-info">
            <span className="home-stat-number">{stats.done}</span>
            <span className="home-stat-label">Completed</span>
          </div>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="home-progress-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Overall Progress</h2>
            <span className="home-progress-percent">
              {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="home-progress-bar">
            <div
              className="home-progress-fill"
              style={{
                width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="home-progress-labels">
            <span>
              <span className="home-progress-dot" style={{ background: "#10b981" }} />
              Completed {stats.done}
            </span>
            <span>
              <span className="home-progress-dot" style={{ background: "#6366f1" }} />
              In Progress {stats.inProgress}
            </span>
            <span>
              <span className="home-progress-dot" style={{ background: "#f59e0b" }} />
              Pending {stats.pending}
            </span>
          </div>
        </div>
      )}

      <div className="home-bottom-grid">
        <div className="home-recent-card">
          <div className="home-section-header">
            <h2 className="home-section-title">Recent Tasks</h2>
            <Link to="/dashboard/tasks" className="home-view-all">
              View all
              <span className="material-icons-round">arrow_forward</span>
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="home-recent-empty">
              <span className="material-icons-round">task_alt</span>
              <p>No tasks yet</p>
              <span>Create your first task to get started</span>
            </div>
          ) : (
            <div className="home-recent-list">
              {recentTasks.map((task) => {
                const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                return (
                  <div key={task.id} className="home-recent-item">
                    <div className="home-recent-dot" style={{ background: config.color }} />
                    <div className="home-recent-info">
                      <span className="home-recent-title">{task.title}</span>
                      <span className="home-recent-date">
                        {task.created_at
                          ? new Date(task.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                    </div>
                    <span
                      className="home-recent-badge"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="home-activity-card">
          <div className="home-section-header">
            <h2 className="home-section-title">Quick Actions</h2>
          </div>
          <div className="home-activity-list">
            {isAdmin && (
              <Link to="/dashboard/employees" className="home-activity-item">
                <div className="home-activity-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                  <span className="material-icons-round">groups</span>
                </div>
                <div className="home-activity-info">
                  <span className="home-activity-title">Manage Employees</span>
                  <span className="home-activity-desc">View and manage team members</span>
                </div>
                <span className="material-icons-round home-activity-arrow">chevron_right</span>
              </Link>
            )}
            <Link to="/dashboard/tasks" className="home-activity-item">
              <div className="home-activity-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}>
                <span className="material-icons-round">add_task</span>
              </div>
              <div className="home-activity-info">
                <span className="home-activity-title">{isAdmin ? "Create Task" : "View Tasks"}</span>
                <span className="home-activity-desc">{isAdmin ? "Add a new task to your list" : "Check your assigned tasks"}</span>
              </div>
              <span className="material-icons-round home-activity-arrow">chevron_right</span>
            </Link>
            <Link to="/dashboard/profile" className="home-activity-item">
              <div className="home-activity-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                <span className="material-icons-round">person</span>
              </div>
              <div className="home-activity-info">
                <span className="home-activity-title">View Profile</span>
                <span className="home-activity-desc">Check your account details</span>
              </div>
              <span className="material-icons-round home-activity-arrow">chevron_right</span>
            </Link>
            <Link to="/dashboard/settings" className="home-activity-item">
              <div className="home-activity-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                <span className="material-icons-round">settings</span>
              </div>
              <div className="home-activity-info">
                <span className="home-activity-title">Settings</span>
                <span className="home-activity-desc">Update your preferences</span>
              </div>
              <span className="material-icons-round home-activity-arrow">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
