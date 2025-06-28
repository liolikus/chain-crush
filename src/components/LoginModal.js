import React, { useState, useEffect } from 'react';

const LoginModal = ({
  showLogin,
  loginError,
  onLogin,
  onClose,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showLogin) {
      setUsername('');
      setPassword('');
    }
  }, [showLogin]);

  if (!showLogin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>🎮 Login to Chain Crush</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">👤 Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>
          {loginError && <div className="login-error">⚠️ {loginError}</div>}
          <button type="submit" className="login-btn">
            🚀 Login & Play
          </button>
          <p className="login-note">
            <small>No registration required - just create a username and password!</small>
            <small>Your login and stats will be remembered automatically</small>
            <small className="security-notice">🔒 Passwords are securely hashed and never stored in plain text</small>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
