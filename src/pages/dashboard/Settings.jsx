import { useState, useEffect } from "react";
import { useProfile } from "../../hooks/useProfile";

export default function Settings() {
  const { displayName, phone, email, user, updateProfile, updatePassword } = useProfile();
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setFormName(displayName);
    setFormPhone(phone);
  }, [displayName, phone]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    if (!formName.trim()) {
      setProfileErr("Display name is required.");
      return;
    }

    setProfileLoading(true);
    const { error } = await updateProfile({
      display_name: formName.trim(),
      phone: formPhone.trim(),
    });
    setProfileLoading(false);

    if (error) {
      setProfileErr(error.message);
    } else {
      setProfileMsg("Profile updated successfully.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (!newPassword.trim()) {
      setPasswordErr("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErr("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErr("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (error) {
      setPasswordErr(error.message);
    } else {
      setPasswordMsg("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="page-settings">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your account settings</p>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon-blue">
              <span className="material-icons-round">person</span>
            </div>
            <div>
              <h3 className="settings-card-title">Personal Information</h3>
              <p className="settings-card-desc">Update your display name and phone number</p>
            </div>
          </div>
          <form className="settings-card-body" onSubmit={handleProfileUpdate}>
            {profileMsg && <div className="settings-success">{profileMsg}</div>}
            {profileErr && <div className="settings-error">{profileErr}</div>}
            <div className="settings-field">
              <label className="settings-label">Display Name</label>
              <input
                type="text"
                className="settings-input"
                placeholder="Your display name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={profileLoading}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">Phone Number</label>
              <input
                type="tel"
                className="settings-input"
                placeholder="+1 (555) 000-0000"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                disabled={profileLoading}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">Email</label>
              <input
                type="email"
                className="settings-input settings-input-disabled"
                value={email}
                disabled
              />
              <span className="settings-hint">Email cannot be changed</span>
            </div>
            <button
              type="submit"
              className="settings-submit"
              disabled={profileLoading}
            >
              {profileLoading ? (
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
          </form>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon-red">
              <span className="material-icons-round">lock</span>
            </div>
            <div>
              <h3 className="settings-card-title">Change Password</h3>
              <p className="settings-card-desc">Update your account password</p>
            </div>
          </div>
          <form className="settings-card-body" onSubmit={handlePasswordUpdate}>
            {passwordMsg && <div className="settings-success">{passwordMsg}</div>}
            {passwordErr && <div className="settings-error">{passwordErr}</div>}
            <div className="settings-field">
              <label className="settings-label">New Password</label>
              <input
                type="password"
                className="settings-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label">Confirm Password</label>
              <input
                type="password"
                className="settings-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordLoading}
              />
            </div>
            <button
              type="submit"
              className="settings-submit settings-submit-red"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <div className="spinner-sm" />
                  Updating...
                </>
              ) : (
                <>
                  <span className="material-icons-round">shield</span>
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
