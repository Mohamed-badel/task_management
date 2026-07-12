import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("employee");
  const [editLoading, setEditLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("employee");
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { profile: currentProfile } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!showModal) {
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormPassword("");
      setFormRole("employee");
      setShowPassword(false);
    }
  }, [showModal]);

  useEffect(() => {
    if (editEmployee) {
      setEditName(editEmployee.display_name || "");
      setEditEmail(editEmployee.email || "");
      setEditPhone(editEmployee.phone || "");
      setEditRole(editEmployee.role || "employee");
    }
  }, [editEmployee]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError("");

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (formPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setFormLoading(true);

    const { data: { session: adminSession } } = await supabase.auth.getSession();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formEmail.trim(),
      password: formPassword,
      options: {
        data: {
          display_name: formName.trim(),
          phone: formPhone.trim(),
        },
      },
    });

    if (signUpError) {
      setFormLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: formName.trim(),
        phone: formPhone.trim() || null,
        role: formRole,
      }, { onConflict: "id" });

      if (profileError) {
        setFormLoading(false);
        setError(profileError.message);
        return;
      }

      await supabase.from("profiles").update({ email: formEmail.trim() }).eq("id", data.user.id);
    }

    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });
    }

    setFormLoading(false);
    setShowModal(false);
    setSuccess(`"${formName}" has been added to the team.`);
    fetchEmployees();
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      setError(error.message);
    } else {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === userId ? { ...emp, role: newRole } : emp
        )
      );
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Remove "${name}" from the team?`)) return;

    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      setError(error.message);
    } else {
      setEmployees((prev) => prev.filter((emp) => emp.id !== userId));
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError("Name is required.");
      return;
    }

    setEditLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editName.trim(),
        phone: editPhone.trim() || null,
        role: editRole,
      })
      .eq("id", editEmployee.id);

    if (error) {
      setEditLoading(false);
      setError(error.message);
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editEmployee.id
          ? { ...emp, display_name: editName.trim(), phone: editPhone.trim() || null, role: editRole }
          : emp
      )
    );

    setEditLoading(false);
    setEditEmployee(null);
    setSuccess(`"${editName}" has been updated.`);
    setTimeout(() => setSuccess(""), 4000);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
    "#ec4899", "#f43f5e", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  ];

  const getColor = (id) => {
    const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return avatarColors[hash % avatarColors.length];
  };

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "admin" && emp.role === "admin") ||
      (filter === "employee" && emp.role === "employee");
    return matchSearch && matchFilter;
  });

  const adminCount = employees.filter((e) => e.role === "admin").length;
  const employeeCount = employees.filter((e) => e.role === "employee").length;

  return (
    <div className="page-employees">
      <div className="employees-header-banner">
        <div className="employees-banner-bg" />
        <div className="employees-banner-content">
          <div className="employees-banner-icon">
            <span className="material-icons-round">groups</span>
          </div>
          <div className="employees-banner-text">
            <h1 className="employees-banner-title">Team Management</h1>
            <p className="employees-banner-subtitle">Manage your team members, roles, and access</p>
          </div>
          <div className="employees-banner-stats">
            <div className="employees-banner-stat">
              <span className="employees-banner-stat-number">{employees.length}</span>
              <span className="employees-banner-stat-label">Members</span>
            </div>
            <div className="employees-banner-stat-divider" />
            <div className="employees-banner-stat">
              <span className="employees-banner-stat-number">{adminCount}</span>
              <span className="employees-banner-stat-label">Admins</span>
            </div>
            <div className="employees-banner-stat-divider" />
            <div className="employees-banner-stat">
              <span className="employees-banner-stat-number">{employeeCount}</span>
              <span className="employees-banner-stat-label">Employees</span>
            </div>
          </div>
        </div>
      </div>

      <div className="employees-toolbar">
        <div className="employees-search">
          <span className="material-icons-round">search</span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="employees-search-clear" onClick={() => setSearch("")}>
              <span className="material-icons-round">close</span>
            </button>
          )}
        </div>
        <div className="employees-filters">
          <button
            className={`employees-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({employees.length})
          </button>
          <button
            className={`employees-filter-btn ${filter === "admin" ? "active" : ""}`}
            onClick={() => setFilter("admin")}
          >
            Admins ({adminCount})
          </button>
          <button
            className={`employees-filter-btn ${filter === "employee" ? "active" : ""}`}
            onClick={() => setFilter("employee")}
          >
            Employees ({employeeCount})
          </button>
        </div>
        <button className="add-employee-btn" onClick={() => setShowModal(true)}>
          <span className="material-icons-round">person_add</span>
          Add Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">
                  <span className="material-icons-round">person_add</span>
                </div>
                <div>
                  <h2 className="modal-title">Add New Employee</h2>
                  <p className="modal-subtitle">Create a new account for a team member</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}
                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label>Full Name *</label>
                    <div className="modal-input-wrapper">
                      <span className="material-icons-round">person</span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        disabled={formLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-form-group">
                    <label>Email *</label>
                    <div className="modal-input-wrapper">
                      <span className="material-icons-round">mail</span>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        disabled={formLoading}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label>Phone</label>
                    <div className="modal-input-wrapper">
                      <span className="material-icons-round">phone</span>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        disabled={formLoading}
                      />
                    </div>
                  </div>
                  <div className="modal-form-group">
                    <label>Password *</label>
                    <div className="modal-input-wrapper">
                      <span className="material-icons-round">lock</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        disabled={formLoading}
                        required
                      />
                      <button
                        type="button"
                        className="modal-input-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <span className="material-icons-round">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>Role</label>
                  <div className="modal-role-select">
                    <button
                      type="button"
                      className={`modal-role-option ${formRole === "employee" ? "active" : ""}`}
                      onClick={() => setFormRole("employee")}
                    >
                      <span className="material-icons-round">badge</span>
                      <div>
                        <span className="modal-role-option-title">Employee</span>
                        <span className="modal-role-option-desc">Can view tasks only</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`modal-role-option ${formRole === "admin" ? "active" : ""}`}
                      onClick={() => setFormRole("admin")}
                    >
                      <span className="material-icons-round">admin_panel_settings</span>
                      <div>
                        <span className="modal-role-option-title">Admin</span>
                        <span className="modal-role-option-desc">Full access to all features</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <div className="spinner-sm" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">person_add</span>
                      Add Employee
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editEmployee && (
        <div className="modal-overlay" onClick={() => setEditEmployee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <div className="modal-header-icon">
                  <span className="material-icons-round">edit</span>
                </div>
                <div>
                  <h2 className="modal-title">Edit Employee</h2>
                  <p className="modal-subtitle">Update {editEmployee.display_name}'s information</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setEditEmployee(null)}>
                <span className="material-icons-round">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee}>
              <div className="modal-body">
                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label>Full Name *</label>
                    <div className="modal-input-wrapper">
                      <span className="material-icons-round">person</span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={editLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-form-group">
                    <label>Email</label>
                    <div className="modal-input-wrapper modal-input-readonly">
                      <span className="material-icons-round">mail</span>
                      <div className="modal-input-disabled-content">
                        <span className="modal-input-disabled-text">{editEmail}</span>
                        <span className="modal-input-hint">Cannot be changed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>Phone</label>
                  <div className="modal-input-wrapper">
                    <span className="material-icons-round">phone</span>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      disabled={editLoading}
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label>Role</label>
                  <div className="modal-role-select">
                    <button
                      type="button"
                      className={`modal-role-option ${editRole === "employee" ? "active" : ""}`}
                      onClick={() => setEditRole("employee")}
                    >
                      <span className="material-icons-round">badge</span>
                      <div>
                        <span className="modal-role-option-title">Employee</span>
                        <span className="modal-role-option-desc">Can view tasks only</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`modal-role-option ${editRole === "admin" ? "active" : ""}`}
                      onClick={() => setEditRole("admin")}
                    >
                      <span className="material-icons-round">admin_panel_settings</span>
                      <div>
                        <span className="modal-role-option-title">Admin</span>
                        <span className="modal-role-option-desc">Full access to all features</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setEditEmployee(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-submit"
                  disabled={editLoading}
                >
                  {editLoading ? (
                    <>
                      <div className="spinner-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="tasks-loading">
          <div className="spinner" />
          <span>Loading employees...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="employees-empty">
          <span className="material-icons-round">groups</span>
          <p>{search ? "No employees match your search" : "No employees yet"}</p>
          <span>{search ? "Try a different search term" : "Click 'Add Employee' to get started"}</span>
        </div>
      ) : (
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const isAdminEmp = emp.role === "admin";
                const isMe = emp.id === currentProfile?.id;
                return (
                  <tr key={emp.id} className={isMe ? "employees-row-me" : ""}>
                    <td>
                      <div className="employees-table-user">
                        <div
                          className="employees-table-avatar"
                          style={{ background: getColor(emp.id) }}
                        >
                          {getInitials(emp.display_name)}
                        </div>
                        <div className="employees-table-user-info">
                          <span className="employees-table-name">
                            {emp.display_name || "Unnamed"}
                            {isMe && <span className="employee-you-badge">You</span>}
                          </span>
                          <span className="employees-table-email">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${isAdminEmp ? "role-admin" : "role-employee"}`}>
                        <span className="material-icons-round">
                          {isAdminEmp ? "admin_panel_settings" : "badge"}
                        </span>
                        {isAdminEmp ? "Admin" : "Employee"}
                      </span>
                    </td>
                    <td className="employees-table-phone">{emp.phone || "—"}</td>
                    <td className="employees-table-date">
                      {new Date(emp.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {!isMe && (
                        <div className="employees-table-actions">
                          <button
                            className="emp-action-btn emp-action-edit"
                            onClick={() => setEditEmployee(emp)}
                            title="Edit"
                          >
                            <span className="material-icons-round">edit</span>
                          </button>
                          {isAdminEmp ? (
                            <button
                              className="emp-action-btn emp-action-demote"
                              onClick={() => handleRoleChange(emp.id, "employee")}
                              title="Remove Admin"
                            >
                              <span className="material-icons-round">downgrade</span>
                            </button>
                          ) : (
                            <button
                              className="emp-action-btn emp-action-promote"
                              onClick={() => handleRoleChange(emp.id, "admin")}
                              title="Make Admin"
                            >
                              <span className="material-icons-round">upgrade</span>
                            </button>
                          )}
                          <button
                            className="emp-action-btn emp-action-delete"
                            onClick={() => handleDelete(emp.id, emp.display_name)}
                            title="Remove"
                          >
                            <span className="material-icons-round">person_remove</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
