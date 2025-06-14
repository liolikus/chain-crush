import React from 'react';

const Leaderboard = ({
  displayLeaderboard,
  isConnected,
  isAdmin,
  onResetLeaderboard,
  activeTournament = null,
  tournamentLeaderboard = null,
}) => {
  // Determine which leaderboard to show
  const currentLeaderboard =
    activeTournament && tournamentLeaderboard ? tournamentLeaderboard : displayLeaderboard;

  const leaderboardTitle = activeTournament
    ? `🏆 ${activeTournament.name} Tournament`
    : '🏆 Leaderboard';

  return (
    <div
      className={`leaderboard ${isAdmin ? 'admin-mode' : ''} ${
        activeTournament ? 'tournament-mode' : ''
      }`}
    >
      <h3>{leaderboardTitle}</h3>

      {activeTournament && (
        <div className="tournament-info">
          <span className="tournament-status">🔥 LIVE TOURNAMENT</span>
          <span className="tournament-time">
            Ends: {new Date(activeTournament.endDate).toLocaleTimeString()}
          </span>
        </div>
      )}

      <div className="leaderboard-list">
        {currentLeaderboard.slice(0, 5).map((entry, index) => (
          <div
            key={index}
            className={`leaderboard-entry ${index === 0 && !entry.isEmpty ? 'first-place' : ''} ${
              entry.isEmpty ? 'empty-entry' : ''
            } ${activeTournament ? 'tournament-entry' : ''}`}
          >
            {entry.isEmpty ? (
              <span className="empty-message">
                🎮 Play your first game to appear on the leaderboard!
              </span>
            ) : (
              <>
                <span className="rank">#{index + 1}</span>
                <span className="score">🏆 {entry.totalScore}</span>
                <span className="games">🎮 {entry.gamesPlayed}g</span>
                <span className="player">👤 {entry.playerId}</span>
                {index === 0 && <span className="crown">👑</span>}
              </>
            )}
          </div>
        ))}
      </div>
      {!isConnected && displayLeaderboard.length > 0 && !displayLeaderboard[0].isEmpty && (
        <p className="local-notice">
          <small>* Local leaderboard (offline mode)</small>
        </p>
      )}
      {isAdmin && (
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
