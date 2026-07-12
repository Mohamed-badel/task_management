import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PasswordChanged from "../pages/PasswordChanged";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/dashboard/Home";
import Tasks from "../pages/dashboard/Tasks";
import Profile from "../pages/dashboard/Profile";
import Settings from "../pages/dashboard/Settings";
import Employees from "../pages/dashboard/Employees";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/password-changed" element={<PasswordChanged />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="employees"
          element={
            <AdminRoute>
              <Employees />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
