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
  return (
    <div className="game-header">
      <div className="timer">
        <div className="timer-label">🎮 GAME TIMER</div>
        <h3>⏰ Time: {formatTime(timeLeft)}</h3>
        <h3>🏆 Score: {scoreDisplay}</h3>
        <p>🎯 Moves: {moves}</p>
        {activeTournament && (
          <p className="tournament-indicator">🏆 Tournament Active: {activeTournament.name}</p>
        )}
        {isConnected && gameStarted && (
          <p className="blockchain-indicator">⛓️ Score will be recorded on microchain!</p>
        )}
        {(!isConnected || connectionTimeout) && gameStarted && (
          <p className="offline-indicator">💾 Playing in offline mode</p>
        )}
      </div>

      <div className="game-controls">
        {!gameStarted && !gameOver && (
          <button
            onClick={onStartGame}
            className="start-btn"
            disabled={isLoading && !connectionTimeout}
          >
            {isLoggedIn
              ? isConnected
                ? '⛓️ Start Microchain Game'
                : '🎮 Start Local Game'
              : '🔐 Login to Play'}
          </button>
        )}

        {gameOver && (
          <div className="game-over">
            <h2>🎉 Game Over!</h2>
            <p>
              Final Score: <strong>{scoreDisplay}</strong>
            </p>
            <p>
              Total Moves: <strong>{moves}</strong>
            </p>
            <p>
              Game Time: <strong>{60 - timeLeft}s</strong>
            </p>
            {activeTournament && (
              <div className="tournament-notice">
                <p className="tournament-success">
                  🏆 Score submitted to {activeTournament.name} tournament!
                </p>
              </div>
            )}
            {isConnected && scoreDisplay > 0 && (
              <div className="token-conversion">
                <p className="blockchain-success">
                  ✅ {Math.floor(scoreDisplay / 10)} tokens minted to your account!
                </p>
                <p>
                  <small>Conversion rate: 10 points = 1 token</small>
                </p>
              </div>
            )}
            {(!isConnected || connectionTimeout) && (
              <p className="offline-notice">💾 Score saved locally (offline mode)</p>
            )}
            <button onClick={onResetGame} className="restart-btn">
              🔄 Play Again
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <button onClick={onResetGame} className="reset-btn">
            🛑 End Game
          </button>
        )}
      </div>
    </div>
  );
};

export default GameControls;
