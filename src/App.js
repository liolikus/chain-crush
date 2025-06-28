import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLinera } from './hooks/useLinera';
import { useAuth } from './hooks/useAuth';
import { useGameLogic } from './hooks/useGameLogic';
import { useGameTimer } from './hooks/useGameTimer';
import { useTournament } from './hooks/useTournament';
import { useAudio } from './hooks/useAudio';
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
import TournamentTimer from './components/TournamentTimer';
import TournamentManager from './components/TournamentManager';
import MuteButton from './components/MuteButton';

const App = () => {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
    tournaments,
    tournamentTimeLeft,
    upcomingTournament,
    timeUntilUpcoming,
    showCreateTournament,
    createTournamentForm,
    createError,
    setShowCreateTournament,
    handleCreateTournament,
    handleDeleteTournament,
    submitTournamentScore,
    getFormattedTimeLeft,
    updateCreateForm,
    loadTournaments
  } = useTournament();

  const [handleGameOverCallback, setHandleGameOverCallback] = useState(null);

  const { timeLeft, formatTime, resetTimer } = useGameTimer(
    gameStarted,
    gameOver,
    handleGameOverCallback
  );

  const { isMuted, isPlaying, hasInteracted, toggleMute } = useAudio();

  const handleGameOver = useCallback(async () => {
    setGameOver(true);
    const gameTime = 60 - timeLeft;

    updateUserStats(currentUser, scoreDisplay, gameTime, moves, setCurrentUser);

    // Submit to tournament if active
    if (activeTournament && currentUser) {
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
    return getDisplayLeaderboard(leaderboard, currentUser, activeTournament);
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
  }, [isLoggedIn, isConnected, startBlockchainGame, resetTimer, resetGameLogic, setShowLogin]);

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

      <LoginModal
        showLogin={showLogin}
        loginError={loginError}
        onLogin={handleLogin}
        onClose={() => setShowLogin(false)}
      />

      <UserBar
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onToggleAdminPanel={toggleAdminPanel}
        showAdminPanel={showAdminPanel}
        upcomingTournament={upcomingTournament}
        timeUntilUpcoming={timeUntilUpcoming}
      />

      {/* Tournament Timer */}
      <TournamentTimer
        activeTournament={activeTournament}
        timeLeft={tournamentTimeLeft}
        formattedTime={getFormattedTimeLeft()}
      />

      {/* Admin Controls */}
      {isAdmin && showAdminPanel && (
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
            <div className="admin-info">
              <p>
                <small>🔧 Admin Mode Active</small>
              </p>
              <p>
                <small>Chain: {isConnected ? 'Connected' : 'Offline'}</small>
              </p>
            </div>
          </div>
          
          {/* Tournament Management */}
          <TournamentManager
            tournaments={tournaments}
            showCreateTournament={showCreateTournament}
            createTournamentForm={createTournamentForm}
            createError={createError}
            onShowCreate={() => setShowCreateTournament(true)}
            onHideCreate={() => setShowCreateTournament(false)}
            onCreateTournament={handleCreateTournament}
            onDeleteTournament={handleDeleteTournament}
            onUpdateForm={updateCreateForm}
          />
        </div>
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

      {/* Mute Button */}
      <MuteButton 
        isMuted={isMuted}
        isPlaying={isPlaying}
        hasInteracted={hasInteracted}
        onToggleMute={toggleMute}
      />
    </div>
  );
};

export default App;
