import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      setLockTimer((prev) => {
        if (prev <= 1000) {
          clearInterval(interval);
          setLocked(false);
          setAttempts(0);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (locked) {
      setError(`Too many attempts. Try again in ${Math.ceil(lockTimer / 1000)}s.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockTimer(LOCKOUT_DURATION);
        setError("Too many failed attempts. Locked for 60 seconds.");
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="TaskFlow" className="auth-logo" />
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}
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
                disabled={loading || locked}
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">lock</span>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || locked}
                autoComplete="current-password"
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
          <div className="auth-row">
            <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || locked}>
            {loading ? "Signing in..." : locked ? `Locked ${Math.ceil(lockTimer / 1000)}s` : "Sign in"}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
}
