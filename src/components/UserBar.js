import React from 'react';

const UserBar = ({ isLoggedIn, currentUser, isAdmin, onLogout }) => {
  if (!isLoggedIn) return null;

  return (
    <div className="user-bar">
      <div className="user-info">
        <span className={`welcome ${isAdmin ? 'admin' : ''}`}>
          👋 Welcome, <strong>{currentUser?.username}</strong>!
          {isAdmin && <span className="admin-badge">Admin</span>}
        </span>
        <div className="user-stats">
          <span>🎮 Games: {currentUser?.gamesPlayed || 0}</span>
          <span>🏆 Best: {currentUser?.bestScore || 0}</span>
          <span>📊 Total: {currentUser?.totalScore || 0}</span>
        </div>
      </div>
      <button onClick={onLogout} className="logout-btn">
        🚪 Logout
      </button>
    </div>
  );
};

export default UserBar;
