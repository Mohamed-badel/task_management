const STATUS_CONFIG = {
  pending: {
    bg: "rgba(245, 158, 11, 0.1)",
    color: "#d97706",
    border: "#f59e0b",
    icon: "schedule",
    label: "Pending",
  },
  in_progress: {
    bg: "rgba(99, 102, 241, 0.1)",
    color: "#6366f1",
    border: "#6366f1",
    icon: "autorenew",
    label: "In Progress",
  },
  done: {
    bg: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    border: "#10b981",
    icon: "check_circle",
    label: "Done",
  },
};

export default function TaskList({ tasks, isAdmin, onEdit, onDelete, onMarkDone, employees, currentUserEmail }) {
  const getAssigneeName = (email) => {
    if (!email) return null;
    const emp = employees?.find((e) => e.email === email);
    return emp?.display_name || email;
  };

  if (tasks.length === 0) {
    return (
      <div className="tasks-empty">
        <div className="tasks-empty-icon">
          <span className="material-icons-round">task_alt</span>
        </div>
        <p>No tasks yet</p>
        <span>{isAdmin ? "Create your first task above to get started" : "No tasks have been assigned yet"}</span>
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => {
        const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
        return (
          <div key={task.id} className="task-card">
            <div className="task-card-accent" style={{ background: config.border }} />
            <div className="task-card-body">
              <div className="task-card-header">
                <div className="task-card-status">
                  <span
                    className="task-card-status-dot"
                    style={{ background: config.color }}
                  />
                  <span
                    className="task-card-status-label"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>
                {isAdmin && (
                  <div className="task-card-actions">
                    <button
                      className="task-card-btn"
                      onClick={() => onEdit(task)}
                      title="Edit"
                    >
                      <span className="material-icons-round">edit</span>
                    </button>
                    <button
                      className="task-card-btn task-card-btn-danger"
                      onClick={() => onDelete(task.id)}
                      title="Delete"
                    >
                      <span className="material-icons-round">delete</span>
                    </button>
                  </div>
                )}
              </div>
              <h3 className="task-card-title">{task.title}</h3>
              {!isAdmin && task.assignee === currentUserEmail && task.status !== "done" && (
                <button
                  className="task-card-done-btn"
                  onClick={() => onMarkDone(task.id)}
                >
                  <span className="material-icons-round">check_circle</span>
                  Mark as Done
                </button>
              )}
              <div className="task-card-footer">
                {task.assignee && (
                  <div className="task-card-assignee">
                    <span className="material-icons-round">person</span>
                    <span>{getAssigneeName(task.assignee)}</span>
                  </div>
                )}
                {!task.assignee && (
                  <div className="task-card-assignee task-card-assignee-unassigned">
                    <span className="material-icons-round">person_off</span>
                    <span>Unassigned</span>
                  </div>
                )}
                <div className="task-card-date">
                  <span className="material-icons-round">calendar_today</span>
                  <span>
                    {task.created_at
                      ? new Date(task.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
