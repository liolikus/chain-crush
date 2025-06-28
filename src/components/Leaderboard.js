import React from 'react';

const Leaderboard = ({
  displayLeaderboard,
  isConnected,
  isAdmin,
  onResetLeaderboard,
  activeTournament,
}) => {
  const getLeaderboardTitle = () => {
    if (activeTournament) {
      return `🏆 ${activeTournament.name} Tournament`;
    }
    return `🏆 ${isConnected ? 'Chain Crush' : 'Chain Crush'} Leaderboard`;
  };

  const getLeaderboardSubtitle = () => {
    if (activeTournament) {
      return 'Tournament Leaderboard';
    }
    return isConnected ? 'Chain Crush Leaderboard' : 'Chain Crush Leaderboard';
  };

  return (
    <div
      className={`leaderboard ${isAdmin ? 'admin-mode' : ''} ${
        activeTournament ? 'tournament-mode' : ''
      }`}
    >
      <h3>{getLeaderboardTitle()}</h3>
      {activeTournament && (
        <div className="tournament-leaderboard-info">
          <small>{getLeaderboardSubtitle()}</small>
        </div>
      )}
      <div className="leaderboard-list">
        {displayLeaderboard.slice(0, 5).map((entry, index) => (
          <div
            key={index}
            className={`leaderboard-entry ${index === 0 && !entry.isEmpty ? 'first-place' : ''} ${
              entry.isEmpty ? 'empty-entry' : ''
            } ${entry.isTournament ? 'tournament-entry' : ''}`}
          >
            {entry.isEmpty ? (
              <span className="empty-message">
                {activeTournament
                  ? '🎮 Play during the tournament to appear here!'
                  : '🎮 Play your first game to appear on the leaderboard!'}
              </span>
            ) : (
              <>
                <span className="rank">#{entry.rank || index + 1}</span>
                <span className="score">🏆 {entry.totalScore}</span>
                {!entry.isTournament && <span className="games">🎮 {entry.gamesPlayed}g</span>}
                <span className="player">👤 {entry.playerId}</span>
                {index === 0 && <span className="crown">👑</span>}
              </>
            )}
          </div>
        ))}
      </div>
      {!isConnected &&
        displayLeaderboard.length > 0 &&
        !displayLeaderboard[0].isEmpty &&
        !activeTournament && (
          <p className="local-notice">
            <small>* Local leaderboard (offline mode)</small>
          </p>
        )}
      {activeTournament && (
        <p className="tournament-notice">
          <small>🏆 Tournament scores are automatically saved</small>
        </p>
      )}
      {isAdmin && !activeTournament && (
        <div className="admin-leaderboard-actions">
          <button onClick={onResetLeaderboard} className="admin-leaderboard-btn">
            🗑️ Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
