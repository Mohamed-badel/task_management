import { useState, useEffect } from "react";
import { useTasks } from "../../hooks/useTasks";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import TaskForm from "../../components/TaskForm";
import TaskList from "../../components/TaskList";

export default function Tasks() {
  const { tasks, loading, error, stats, addTask, updateTask, deleteTask } = useTasks();
  const { isAdmin, user } = useAuth();
  const [editingTask, setEditingTask] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("display_name", { ascending: true });
    if (error) console.error("Failed to fetch employees:", error.message);
    if (data) setEmployees(data);
  };

  const handleAdd = async ({ title, status, assignee }) => {
    const success = await addTask({ title, status, assignee });
    if (success) setEditingTask(null);
  };

  const handleUpdate = async ({ title, status, assignee }) => {
    const success = await updateTask(editingTask.id, { title, status, assignee });
    if (success) setEditingTask(null);
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
  };

  const handleMarkDone = async (taskId) => {
    await updateTask(taskId, { status: "done" });
  };

  return (
    <div className="page-tasks">
      <div className="tasks-header-banner">
        <div className="employees-banner-bg" />
        <div className="employees-banner-content">
          <div className="employees-banner-icon">
            <span className="material-icons-round">task_alt</span>
          </div>
          <div className="employees-banner-text">
            <h1 className="employees-banner-title">Tasks</h1>
            <p className="employees-banner-subtitle">
              {isAdmin ? "Create, edit and manage all tasks" : "View tasks assigned by admin"}
            </p>
          </div>
          {tasks.length > 0 && (
            <div className="employees-banner-stats">
              <div className="employees-banner-stat">
                <span className="employees-banner-stat-number">{stats.total}</span>
                <span className="employees-banner-stat-label">Total</span>
              </div>
              <div className="employees-banner-stat-divider" />
              <div className="employees-banner-stat">
                <span className="employees-banner-stat-number">{stats.inProgress}</span>
                <span className="employees-banner-stat-label">In Progress</span>
              </div>
              <div className="employees-banner-stat-divider" />
              <div className="employees-banner-stat">
                <span className="employees-banner-stat-number">{stats.pending}</span>
                <span className="employees-banner-stat-label">Pending</span>
              </div>
              <div className="employees-banner-stat-divider" />
              <div className="employees-banner-stat">
                <span className="employees-banner-stat-number">{stats.done}</span>
                <span className="employees-banner-stat-label">Done</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isAdmin ? (
        <TaskForm
          onSubmit={editingTask ? handleUpdate : handleAdd}
          editingTask={editingTask}
          onCancel={() => setEditingTask(null)}
          employees={employees}
        />
      ) : (
        <div className="role-notice role-notice-employee">
          <span className="material-icons-round">info</span>
          <span>Only <strong>Admins</strong> can create and manage tasks. You have view-only access.</span>
        </div>
      )}

      {loading ? (
        <div className="tasks-loading">
          <div className="spinner" />
          <span>Loading tasks...</span>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          isAdmin={isAdmin}
          onEdit={isAdmin ? setEditingTask : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          onMarkDone={!isAdmin ? handleMarkDone : undefined}
          employees={employees}
          currentUserEmail={user?.email}
        />
      )}
    </div>
  );
}
