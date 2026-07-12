import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="TaskFlow" className="auth-logo" />
        <h1>Reset password</h1>
        <p className="subtitle">Enter your email and we'll send you a reset link</p>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">mail</span>
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="auth-link">
          Remember your password? <Link to="/">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
