import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60000;

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return score;
}

const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword && password === confirmPassword;

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
    setMessage("");

    if (locked) {
      setError(`Too many attempts. Try again in ${Math.ceil(lockTimer / 1000)}s.`);
      return;
    }

    if (!displayName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all required fields.");
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

    const { data, error } = await signUp(email, password, {
      display_name: displayName,
      phone: phone,
    });

    if (error) {
      setLoading(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true);
        setLockTimer(LOCKOUT_DURATION);
        setError("Too many attempts. Locked for 60 seconds.");
      } else {
        setError(error.message);
      }
      return;
    }

    if (data.session) {
      setLoading(false);
      navigate("/dashboard");
      return;
    }

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setMessage("Account created! You can now log in.");
      setTimeout(() => navigate("/"), 2000);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="TaskFlow" className="auth-logo" />
        <h1>Create account</h1>
        <p className="subtitle">Fill in your details to get started</p>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">person</span>
              </span>
              <input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading || locked}
                autoComplete="name"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <span className="material-icons-round">phone</span>
              </span>
              <input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || locked}
                autoComplete="tel"
              />
            </div>
          </div>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || locked}
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
            {password.length > 0 && (
              <div className="password-strength">
                <div className="strength-bar">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-segment"
                      style={{
                        background: i < strength ? strengthColors[strength - 1] : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength - 1] || "#94a3b8" }}>
                  {strengthLabels[strength - 1] || "Too short"}
                </span>
              </div>
            )}
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
                disabled={loading || locked}
                autoComplete="new-password"
                required
              />
              {confirmPassword && (
                <span className={`input-status ${passwordsMatch ? "valid" : "invalid"}`}>
                  <span className="material-icons-round">
                    {passwordsMatch ? "check_circle" : "cancel"}
                  </span>
                </span>
              )}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || locked}>
            {loading ? "Creating account..." : locked ? `Locked ${Math.ceil(lockTimer / 1000)}s` : "Create account"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
