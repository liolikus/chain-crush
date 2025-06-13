import React from 'react';

const Leaderboard = ({
  displayLeaderboard,
  isConnected,
  isAdmin,
  onResetLeaderboard,
  activeTournament,
}) => {
  const isTournamentMode = !!activeTournament;

  return (
    <div className={`leaderboard ${isTournamentMode ? 'tournament-mode' : ''}`}>
      <div className="leaderboard-header">
        <h2>{isTournamentMode ? <>🏆 {activeTournament.title}</> : <>🏆 Leaderboard</>}</h2>
        {isTournamentMode && (
          <div className="tournament-info-small">
            <small>{activeTournament.participants?.length || 0} participants</small>
          </div>
        )}
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'offline'}`}></span>
          <span>{isConnected ? 'Live' : 'Local'}</span>
        </div>
      </div>

      <div className="leaderboard-content">
        {displayLeaderboard.length === 0 ? (
          <div className="empty-leaderboard">
            <p>{isTournamentMode ? '🎯 No tournament scores yet!' : '🎯 No scores yet!'}</p>
            <p>
              <small>
                {isTournamentMode
                  ? 'Be the first to score in this tournament!'
                  : 'Play a game to get on the leaderboard!'}
              </small>
            </p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {displayLeaderboard.slice(0, 10).map((player, index) => (
              <div
                key={player.username}
                className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}
              >
                <div className="rank">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>
                <div className="player-info">
                  <div className="username">{player.username}</div>
                  <div className="stats">
                    {isTournamentMode ? (
                      <span className="tournament-score">{player.highScore} pts</span>
                    ) : (
                      <>
                        <span className="high-score">Best: {player.highScore}</span>
                        <span className="games-played">Games: {player.totalGames}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="score-display">
                  {isTournamentMode ? (
                    <div className="tournament-stats">
                      <div className="main-score">{player.highScore}</div>
                      <div className="sub-stats">
                        <small>{player.bestTime}s</small>
                      </div>
                    </div>
                  ) : (
                    <div className="regular-stats">
                      <div className="main-score">{player.highScore}</div>
                      <div className="sub-stats">
                        <small>Avg: {Math.round(player.averageScore)}</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && !isTournamentMode && (
        <div className="admin-controls-leaderboard">
          <button onClick={onResetLeaderboard} className="reset-btn" title="Reset Leaderboard">
            🗑️ Reset
          </button>
        </div>
      )}

      {isTournamentMode && (
        <div className="tournament-footer">
          <small>🕒 Tournament ends: {new Date(activeTournament.endDate).toLocaleString()}</small>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
