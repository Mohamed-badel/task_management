import { useState, useEffect } from "react";

const STATUSES = [
  { value: "pending", label: "Pending", icon: "schedule" },
  { value: "in_progress", label: "In Progress", icon: "autorenew" },
  { value: "done", label: "Done", icon: "check_circle" },
];

export default function TaskForm({ onSubmit, editingTask, onCancel, employees }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignee, setAssignee] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setStatus(editingTask.status || "pending");
      setAssignee(editingTask.assignee || "");
    } else {
      setTitle("");
      setStatus("pending");
      setAssignee("");
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), status, assignee: assignee || null });
    if (!editingTask) {
      setTitle("");
      setStatus("pending");
      setAssignee("");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-card">
        <div className="task-form-row">
          <div className="task-form-input-group">
            <span className="material-icons-round task-form-input-icon">edit_note</span>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="task-form-input"
            />
          </div>
          <div className="task-form-select-group">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="task-form-select"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="task-form-select-group">
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="task-form-select"
            >
              <option value="">Unassigned</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.email}>
                  {emp.display_name || emp.email}
                </option>
              ))}
            </select>
          </div>
          <div className="task-form-actions">
            <button type="submit" className="task-form-submit">
              <span className="material-icons-round">
                {editingTask ? "update" : "add_task"}
              </span>
              <span>{editingTask ? "Update Task" : "Add Task"}</span>
            </button>
            {editingTask && (
              <button
                type="button"
                className="task-form-cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
