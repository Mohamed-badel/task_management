import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) {
      setError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        setError("Session expired. Please request a new reset link.");
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      navigate("/password-changed");
    }
  };

  if (!sessionReady && !error) {
    return (
      <div className="auth-container">
        <div className="auth-card auth-card-center">
          <img src={logo} alt="TaskFlow" className="auth-logo" />
          <div className="spinner" />
          <p className="subtitle" style={{ marginTop: 16 }}>Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="TaskFlow" className="auth-logo" />
        <h1>New password</h1>
        <p className="subtitle">Enter your new password below</p>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">lock</span>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <span className="material-icons-round">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">shield</span>
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !sessionReady}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
