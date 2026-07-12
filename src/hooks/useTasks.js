import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { isAdmin, profile } = useAuth();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdmin && profile?.email) {
      query = query.or(`assignee.is.null,assignee.eq.${profile.email}`);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [isAdmin, profile]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async ({ title, status, assignee }) => {
    setError("");
    const { error } = await supabase.from("tasks").insert({
      title,
      status,
      assignee: assignee || null,
    });
    if (error) {
      setError(error.message);
      return false;
    }
    await fetchTasks();
    return true;
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId, { title, status, assignee }) => {
    setError("");
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (assignee !== undefined) updates.assignee = assignee;
    const { error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId);
    if (error) {
      setError(error.message);
      return false;
    }
    await fetchTasks();
    return true;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (taskId) => {
    setError("");
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);
    if (error) {
      setError(error.message);
      return false;
    }
    await fetchTasks();
    return true;
  }, [fetchTasks]);

  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
  };

  return {
    tasks,
    loading,
    error,
    stats,
    addTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
