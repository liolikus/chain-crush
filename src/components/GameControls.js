import React from 'react';

const GameControls = ({
  gameStarted,
  gameOver,
  isLoggedIn,
  isConnected,
  isLoading,
  connectionTimeout,
  scoreDisplay,
  moves,
  timeLeft,
  onStartGame,
  onResetGame,
  formatTime,
  activeTournament,
}) => {
  const isTournamentActive = !!activeTournament;

  return (
    <div className={`game-controls ${isTournamentActive ? 'tournament-active' : ''}`}>
      <div className="score-section">
        <div className="score-display">
          <span className="score-label">Score</span>
          <span className="score-value">{scoreDisplay}</span>
        </div>
        <div className="moves-display">
          <span className="moves-label">Moves</span>
          <span className="moves-value">{moves}</span>
        </div>
        <div className="timer-display">
          <span className="timer-label">Time</span>
          <span className={`timer-value ${timeLeft <= 10 && gameStarted ? 'warning' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {isTournamentActive && (
        <div className="tournament-status">
          <div className="tournament-badge">
            <span className="tournament-icon">🏆</span>
            <div className="tournament-details">
              <div className="tournament-name">{activeTournament.title}</div>
              <div className="tournament-participants">
                {activeTournament.participants?.length || 0} players
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="control-buttons">
        {!gameStarted ? (
          <button
            onClick={onStartGame}
            className={`start-btn ${!isLoggedIn ? 'login-required' : ''}`}
            disabled={isLoading && !connectionTimeout}
          >
            {!isLoggedIn
              ? '🔐 Login to Play'
              : isTournamentActive
              ? '🏆 Join Tournament'
              : '🎮 Start Game'}
          </button>
        ) : (
          <button onClick={onResetGame} className="reset-btn">
            🔄 Reset Game
          </button>
        )}
      </div>

      <div className="game-status">
        {gameOver && (
          <div className="game-over-status">
            <span className="status-icon">🎉</span>
            <span>Game Complete!</span>
          </div>
        )}
        {gameStarted && !gameOver && (
          <div className="game-active-status">
            <span className="status-icon">🎯</span>
            <span>Game Active</span>
            {isTournamentActive && <span className="tournament-indicator">• Tournament</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
