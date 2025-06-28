import React from 'react';

const UserBar = ({ 
  isLoggedIn, 
  currentUser, 
  isAdmin, 
  onLogout, 
  onToggleAdminPanel, 
  showAdminPanel,
  upcomingTournament,
  timeUntilUpcoming
}) => {
  if (!isLoggedIn) return null;

  const formatTimeUntil = (timeLeft) => {
    if (timeLeft <= 0) return '00:00:00';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
        {upcomingTournament && (
          <div className="upcoming-tournament">
            <span className="upcoming-label">🏆 Next Tournament:</span>
            <span className="upcoming-name">{upcomingTournament.name}</span>
            <span className="upcoming-timer">⏰ {formatTimeUntil(timeUntilUpcoming)}</span>
          </div>
        )}
      </div>
      <div className="user-actions">
        {isAdmin && (
          <button 
            onClick={onToggleAdminPanel} 
            className={`admin-toggle-btn ${showAdminPanel ? 'active' : ''}`}
            title="Admin Panel"
          >
            ⚙️ Admin
          </button>
        )}
        <button onClick={onLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default UserBar;
