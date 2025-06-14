import React from 'react';

const LoginModal = ({
  showLogin,
  username,
  password,
  loginError,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onClose,
}) => {
  if (!showLogin) return null;

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>🎮 Login to Chain Crush</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">👤 Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={onUsernameChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">🔒 DO NOT USE REAL PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={onPasswordChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <div className="form-group checkbox-group">
            {/* <label className="checkbox-label">
              <input type="checkbox" checked={true} readOnly />
              <span className="checkmark"></span>
              🔒 Remember my login (always enabled)
            </label> */}
          </div>
          {loginError && <div className="login-error">⚠️ {loginError}</div>}
          <button type="submit" className="login-btn">
            🚀 Login & Play
          </button>
          <p className="login-note">
            <small>No registration required - just create a username and password!</small>
            <small>Your login and stats will be remembered automatically</small>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
