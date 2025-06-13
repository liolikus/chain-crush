import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLinera } from './hooks/useLinera';
import { useAuth } from './hooks/useAuth';
import { useGameLogic } from './hooks/useGameLogic';
import { useGameTimer } from './hooks/useGameTimer';
import { useTournament } from './hooks/useTournament';
import { resetLeaderboardData } from './utils/adminUtils';
import { getDisplayLeaderboard, updateUserStats } from './utils/leaderboardUtils';

// Components
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import LoginModal from './components/LoginModal';
import UserBar from './components/UserBar';
import Leaderboard from './components/Leaderboard';
import BlockchainInfo from './components/BlockchainInfo';
import LoadingScreen from './components/LoadingScreen';
import TournamentModal from './components/TournamentModal';
import TournamentInfo from './components/TournamentInfo';
import TournamentManagement from './components/TournamentManagement';

const App = () => {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [showTournamentNotification, setShowTournamentNotification] = useState(false);

  // Custom hooks
  const {
    isLoggedIn,
    showLogin,
    username,
    password,
    loginError,
    currentUser,
    isAdmin,
    setShowLogin,
    setUsername,
    setPassword,
    setCurrentUser,
    handleLogin,
    handleLogout,
  } = useAuth();

  const {
    currentColorArrangement,
    setCurrentColorArrangement,
    scoreDisplay,
    moves,
    dragStart,
    dragDrop,
    dragEnd,
    createBoard,
    resetGame: resetGameLogic,
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
  } = useGameLogic();

  const {
    isConnected,
    isLoading,
    leaderboard,
    submitScore,
    startGame: startBlockchainGame,
    endGame: endBlockchainGame,
    status,
    error,
    chainId,
    identity,
    applicationId,
  } = useLinera();

  const {
    activeTournament,
    // upcomingTournament,
    tournamentStatusChanged,
    joinTournament,
    submitTournamentScore,
    createNewTournament,
  } = useTournament(currentUser);

  const [handleGameOverCallback, setHandleGameOverCallback] = useState(null);

  const { timeLeft, formatTime, resetTimer } = useGameTimer(
    gameStarted,
    gameOver,
    handleGameOverCallback
  );

  // Tournament notification effect
  useEffect(() => {
    if (tournamentStatusChanged) {
      setShowTournamentNotification(true);
      setTimeout(() => setShowTournamentNotification(false), 5000);
    }
  }, [tournamentStatusChanged]);

  const handleGameOver = useCallback(async () => {
    setGameOver(true);
    const gameTime = 60 - timeLeft;

    updateUserStats(currentUser, scoreDisplay, gameTime, moves, setCurrentUser);

    // Submit to tournament if active
    if (activeTournament && currentUser?.username) {
      submitTournamentScore(currentUser.username, scoreDisplay, gameTime, moves);
    }

    if (isConnected && scoreDisplay > 0) {
      try {
        await submitScore(scoreDisplay, gameTime, moves);
        await endBlockchainGame();
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  }, [
    isConnected,
    scoreDisplay,
    moves,
    submitScore,
    endBlockchainGame,
    currentUser,
    setCurrentUser,
    timeLeft,
    activeTournament,
    submitTournamentScore,
  ]);

  // Update the callback when handleGameOver changes
  useEffect(() => {
    setHandleGameOverCallback(() => handleGameOver);
  }, [handleGameOver]);

  const displayLeaderboard = useMemo(() => {
    // If there's an active tournament, show tournament leaderboard
    if (activeTournament && activeTournament.leaderboard) {
      return activeTournament.leaderboard.map((entry) => ({
        username: entry.username,
        highScore: entry.score,
        bestTime: entry.gameTime,
        totalGames: 1,
        averageScore: entry.score,
        lastPlayed: entry.timestamp,
      }));
    }
    return getDisplayLeaderboard(leaderboard, currentUser);
  }, [leaderboard, currentUser, activeTournament]);

  // Connection timeout handling
  useEffect(() => {
    if (isConnected && !isLoading) {
      setConnectionTimeout(false);
      setTimeoutCountdown(60);
    }
  }, [isConnected, isLoading]);

  useEffect(() => {
    let timeoutTimer;
    let countdownTimer;

    if (isLoading && !isConnected && !connectionTimeout) {
      countdownTimer = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            setConnectionTimeout(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timeoutTimer = setTimeout(() => {
        setConnectionTimeout(true);
      }, 60000);
    }

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(countdownTimer);
    };
  }, [isLoading, isConnected, connectionTimeout]);

  // Game mechanics
  useEffect(() => {
    createBoard();
  }, [createBoard]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      checkForColumnOfFour();
      checkForRowOfFour();
      checkForColumnOfThree();
      checkForRowOfThree();
      moveIntoSquareBelow();
      setCurrentColorArrangement([...currentColorArrangement]);
    }, 100);
    return () => clearInterval(timer);
  }, [
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
    currentColorArrangement,
    gameStarted,
    gameOver,
    setCurrentColorArrangement,
  ]);

  // Game actions
  const startGame = useCallback(async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    try {
      if (isConnected) {
        await startBlockchainGame();
      }

      // Auto-join active tournament
      if (activeTournament && currentUser?.username) {
        joinTournament(activeTournament.id, currentUser.username);
      }

      setGameStarted(true);
      setGameOver(false);
      resetTimer();
      resetGameLogic();
    } catch (error) {
      console.error('Failed to start game:', error);
      setGameStarted(true);
      setGameOver(false);
      resetTimer();
      resetGameLogic();
    }
  }, [
    isLoggedIn,
    isConnected,
    startBlockchainGame,
    resetTimer,
    resetGameLogic,
    setShowLogin,
    activeTournament,
    currentUser,
    joinTournament,
  ]);

  const resetGame = useCallback(async () => {
    try {
      if (isConnected && gameStarted) {
        await endBlockchainGame();
      }
    } catch (error) {
      console.error('Failed to end game:', error);
    } finally {
      setGameStarted(false);
      setGameOver(false);
      resetTimer();
      resetGameLogic();
    }
  }, [isConnected, gameStarted, endBlockchainGame, resetTimer, resetGameLogic]);

  const proceedWithLocalGame = useCallback(() => {
    setConnectionTimeout(true);
  }, []);

  // Admin functions
  const resetLeaderboard = useCallback(() => {
    if (!isAdmin) return;

    if (window.confirm('Are you sure you want to reset the leaderboard?')) {
      const success = resetLeaderboardData(currentUser, setCurrentUser);
      if (success) {
        alert('Leaderboard has been reset!');
      }
    }
  }, [isAdmin, currentUser, setCurrentUser]);
  const toggleAdminPanel = useCallback(() => {
    if (!isAdmin) return;
    setShowAdminPanel((prev) => !prev);
  }, [isAdmin]);

  const handleCreateTournament = useCallback(
    (tournamentData) => {
      return createNewTournament(tournamentData);
    },
    [createNewTournament]
  );

  // Enhanced drag handlers that check game state
  const handleDragStart = useCallback(
    (e) => {
      if (gameOver || !gameStarted) return;
      dragStart(e);
    },
    [gameOver, gameStarted, dragStart]
  );

  const handleDragDrop = useCallback(
    (e) => {
      if (gameOver || !gameStarted) return;
      dragDrop(e);
    },
    [gameOver, gameStarted, dragDrop]
  );

  const handleDragEnd = useCallback(() => {
    if (gameOver || !gameStarted) return;
    dragEnd();
  }, [gameOver, gameStarted, dragEnd]);

  return (
    <div className="app">
      <LoadingScreen
        isLoading={isLoading}
        connectionTimeout={connectionTimeout}
        status={status}
        timeoutCountdown={timeoutCountdown}
        onProceedLocal={proceedWithLocalGame}
      />

      {error && !isConnected && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <p>
            <small>Game will continue in offline mode</small>
          </p>
        </div>
      )}

      {/* Tournament Status Notification */}
      {showTournamentNotification && (
        <div className="tournament-notification">
          <div className="notification-content">
            {activeTournament ? (
              <span>🏆 Tournament "{activeTournament.title}" is now LIVE!</span>
            ) : (
              <span>🏁 Tournament has ended!</span>
            )}
          </div>
        </div>
      )}

      <LoginModal
        showLogin={showLogin}
        username={username}
        password={password}
        loginError={loginError}
        onUsernameChange={(e) => setUsername(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onLogin={handleLogin}
        onClose={() => setShowLogin(false)}
      />

      <TournamentModal
        showModal={showTournamentModal}
        onClose={() => setShowTournamentModal(false)}
        onCreateTournament={handleCreateTournament}
      />

      <UserBar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      {/* Tournament Info */}
      <TournamentInfo />

      {/* Admin Controls */}
      {isAdmin && (
        <>
          {!showAdminPanel ? (
            <button onClick={toggleAdminPanel} className="admin-toggle" title="Admin Panel">
              ⚙️
            </button>
          ) : (
            <div className="admin-controls">
              <div className="admin-header">
                <h3>Admin Panel</h3>
                <button onClick={toggleAdminPanel} className="close-btn">
                  ✕
                </button>
              </div>
              <div className="admin-actions">
                <button onClick={resetLeaderboard} className="admin-btn danger">
                  🗑️ Reset Leaderboard
                </button>
                <button onClick={() => setShowTournamentModal(true)} className="admin-btn primary">
                  🏆 Create Tournament
                </button>
                <div className="admin-info">
                  <p>
                    <small>🔧 Admin Mode Active</small>
                  </p>
                  <p>
                    <small>Chain: {isConnected ? 'Connected' : 'Offline'}</small>
                  </p>
                  {activeTournament && (
                    <p>
                      <small>🏆 Active: {activeTournament.title}</small>
                    </p>
                  )}
                </div>
              </div>

              {/* Tournament Management Section */}
              <div className="admin-section">
                <TournamentManagement
                  currentUser={currentUser}
                  onCreateTournament={() => setShowTournamentModal(true)}
                />
              </div>
            </div>
          )}
        </>
      )}

      <div className="top-layout">
        <BlockchainInfo
          isConnected={isConnected}
          connectionTimeout={connectionTimeout}
          chainId={chainId}
          identity={identity}
          applicationId={applicationId}
        />

        <div className="game-container">
          <GameBoard
            currentColorArrangement={currentColorArrangement}
            gameOver={gameOver}
            gameStarted={gameStarted}
            onDragStart={handleDragStart}
            onDragDrop={handleDragDrop}
            onDragEnd={handleDragEnd}
          />

          <GameControls
            gameStarted={gameStarted}
            gameOver={gameOver}
            isLoggedIn={isLoggedIn}
            isConnected={isConnected}
            isLoading={isLoading}
            connectionTimeout={connectionTimeout}
            scoreDisplay={scoreDisplay}
            moves={moves}
            timeLeft={timeLeft}
            onStartGame={startGame}
            onResetGame={resetGame}
            formatTime={formatTime}
            activeTournament={activeTournament}
          />

          <div className="blockchain-status">
            <div className="status-indicator">
              <span
                className={`status-dot ${isConnected && !isLoading ? 'connected' : 'disconnected'}`}
              ></span>
              <span>
                Linera Microchain:{' '}
                {isConnected && !isLoading
                  ? '🟢 Connected'
                  : connectionTimeout
                  ? '🟡 Offline Mode'
                  : '🔴 Connecting...'}
              </span>
              {status !== 'Ready' && status !== 'Error' && !connectionTimeout && (
                <span className="status-text"> - {status}</span>
              )}
            </div>
          </div>
        </div>

        <Leaderboard
          displayLeaderboard={displayLeaderboard}
          isConnected={isConnected}
          isAdmin={isAdmin}
          onResetLeaderboard={resetLeaderboard}
          activeTournament={activeTournament}
        />
      </div>

      {/* Game Over Popup */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-popup">
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

            {/* Tournament Results */}
            {activeTournament && (
              <div className="tournament-results">
                <h3>🏆 Tournament: {activeTournament.title}</h3>
                <p>
                  Your tournament score: <strong>{scoreDisplay}</strong>
                </p>
                {activeTournament.leaderboard && activeTournament.leaderboard.length > 0 && (
                  <div className="tournament-ranking">
                    <p>
                      Current Rank: #
                      {activeTournament.leaderboard.findIndex(
                        (entry) => entry.username === currentUser?.username
                      ) + 1}{' '}
                      of {activeTournament.leaderboard.length}
                    </p>
                    <p>
                      Leader: {activeTournament.leaderboard[0].username}(
                      {activeTournament.leaderboard[0].score} pts)
                    </p>
                  </div>
                )}
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
            <button onClick={resetGame} className="restart-btn">
              🔄 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Linera Logo */}
      <div className="linera-logo">
        <img src="/Linera_Red_H.svg" alt="Linera" />
      </div>
    </div>
  );
};

export default App;
