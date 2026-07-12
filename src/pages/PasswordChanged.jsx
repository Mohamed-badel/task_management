import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function PasswordChanged() {
  return (
    <div className="auth-container">
      <div className="auth-card auth-card-center">
        <img src={logo} alt="TaskFlow" className="auth-logo" />
        <div className="success-icon">
          <span className="material-icons-round">check_circle</span>
        </div>
        <h1>Password updated</h1>
        <p className="subtitle">Your password has been changed successfully.</p>
        <Link to="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", textAlign: "center" }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
