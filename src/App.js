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
import ScorePopup from './components/ScorePopup';

// Mobile-optimized Game Over Modal Component
const GameOverModal = React.memo(({ 
  gameOver, 
  scoreDisplay, 
  moves, 
  timeLeft, 
  activeTournament, 
  isConnected, 
  connectionTimeout, 
  onResetGame 
}) => {
  if (!gameOver) return null;

  return (
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
              ✅ {Math.floor(scoreDisplay / 10)} test-tokens minted to your account!
            </p>
            <p>
              <small>Conversion rate: 10 points = 1 test-token</small>
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
    </div>
  );
});

GameOverModal.displayName = 'GameOverModal';

// Mobile-optimized Blockchain Status Component
const BlockchainStatus = React.memo(({ isConnected, isLoading, connectionTimeout, status }) => (
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
));

BlockchainStatus.displayName = 'BlockchainStatus';

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
    loginError,
    currentUser,
    isAdmin,
    setShowLogin,
    setCurrentUser,
    handleLogin,
    handleLogout,
  } = useAuth();

  const [handleGameOverCallback, setHandleGameOverCallback] = useState(null);

  const { timeLeft, formatTime, resetTimer } = useGameTimer(
    gameStarted,
    gameOver,
    handleGameOverCallback
  );

  const { isMuted, isPlaying, hasInteracted, toggleMute, playSoundEffect } = useAudio();

  // Create a memoized playSoundEffect callback to avoid initialization issues
  const playSoundEffectCallback = useCallback(
    (soundName) => {
      if (playSoundEffect) {
        playSoundEffect(soundName);
      }
    },
    [playSoundEffect]
  );

  const {
    currentColorArrangement,
    setCurrentColorArrangement,
    scoreDisplay,
    moves,
    animationStates,
    scorePopups,
    dragStart,
    dragDrop,
    dragEnd,
    touchStart,
    touchMove,
    touchEnd,
    createBoard,
    resetGame: resetGameLogic,
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
  } = useGameLogic(playSoundEffectCallback);

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
  } = useTournament();

  // Memoized game over handler for better performance
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

  // Memoized event handlers for better performance
  const handleDragStart = useCallback((e) => dragStart(e), [dragStart]);
  const handleDragDrop = useCallback((e) => dragDrop(e), [dragDrop]);
  const handleDragEnd = useCallback((e) => dragEnd(e), [dragEnd]);
  const handleTouchStart = useCallback((e) => touchStart(e), [touchStart]);
  const handleTouchMove = useCallback((e) => touchMove(e), [touchMove]);
  const handleTouchEnd = useCallback((e) => touchEnd(e), [touchEnd]);

  // Memoized game control handlers
  const startGame = useCallback(async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setGameStarted(true);
    setGameOver(false);
    resetGameLogic();
    resetTimer();

    if (isConnected) {
      try {
        await startBlockchainGame();
      } catch (error) {
        console.error('Failed to start blockchain game:', error);
      }
    }
  }, [isLoggedIn, isConnected, setShowLogin, resetGameLogic, resetTimer, startBlockchainGame]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameOver(false);
    resetGameLogic();
    resetTimer();
  }, [resetGameLogic, resetTimer]);

  // Memoized leaderboard data
  const displayLeaderboard = useMemo(() => 
    getDisplayLeaderboard(leaderboard, currentUser), 
    [leaderboard, currentUser]
  );

  const resetLeaderboard = useCallback(async () => {
    if (isAdmin) {
      await resetLeaderboardData();
      window.location.reload();
    }
  }, [isAdmin]);

  // Connection timeout effect
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setConnectionTimeout(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Countdown effect for connection timeout
  useEffect(() => {
    if (isLoading && !connectionTimeout) {
      const interval = setInterval(() => {
        setTimeoutCountdown((prev) => {
          if (prev <= 1) {
            setConnectionTimeout(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading, connectionTimeout]);

  // Game logic effects
  useEffect(() => {
    const timer = setInterval(() => {
      checkForColumnOfFour();
      checkForRowOfFour();
      checkForColumnOfThree();
      checkForRowOfThree();
      moveIntoSquareBelow();
    }, 100);

    return () => clearInterval(timer);
  }, [
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
  ]);

  useEffect(() => {
    createBoard();
  }, [createBoard]);

  // Memoized render sections for better performance
  const gameSection = useMemo(() => (
    <div className="game-container">
      <GameBoard
        currentColorArrangement={currentColorArrangement}
        gameOver={gameOver}
        gameStarted={gameStarted}
        animationStates={animationStates}
        onDragStart={handleDragStart}
        onDragDrop={handleDragDrop}
        onDragEnd={handleDragEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Score Popups */}
      {scorePopups.map((popup) => (
        <ScorePopup
          key={popup.id}
          score={popup.score}
          position={popup.position}
          onComplete={() => {
            // Popup will be automatically removed by the hook
          }}
        />
      ))}

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

      <BlockchainStatus
        isConnected={isConnected}
        isLoading={isLoading}
        connectionTimeout={connectionTimeout}
        status={status}
      />
    </div>
  ), [
    currentColorArrangement,
    gameOver,
    gameStarted,
    animationStates,
    scorePopups,
    isLoggedIn,
    isConnected,
    isLoading,
    connectionTimeout,
    scoreDisplay,
    moves,
    timeLeft,
    activeTournament,
    status,
    handleDragStart,
    handleDragDrop,
    handleDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    startGame,
    resetGame,
    formatTime,
  ]);

  if (isLoading && !connectionTimeout) {
    return (
      <LoadingScreen
        timeoutCountdown={timeoutCountdown}
        onSkip={() => setConnectionTimeout(true)}
      />
    );
  }

  return (
    <div className="app">
      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          showLogin={showLogin}
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
          error={loginError}
        />
      )}

      {/* User Bar */}
      {isLoggedIn && (
        <UserBar
          currentUser={currentUser}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onToggleAdmin={() => setShowAdminPanel(!showAdminPanel)}
        />
      )}

      {/* Tournament Manager */}
      {isAdmin && showAdminPanel && (
        <TournamentManager
          tournaments={tournaments}
          showCreateTournament={showCreateTournament}
          createTournamentForm={createTournamentForm}
          createError={createError}
          onShowCreateTournament={setShowCreateTournament}
          onCreateTournament={handleCreateTournament}
          onDeleteTournament={handleDeleteTournament}
          onUpdateForm={updateCreateForm}
        />
      )}

      {/* Tournament Timer */}
      {activeTournament && (
        <TournamentTimer
          activeTournament={activeTournament}
          tournamentTimeLeft={tournamentTimeLeft}
          getFormattedTimeLeft={getFormattedTimeLeft}
        />
      )}

      {upcomingTournament && !activeTournament && (
        <div className="upcoming-tournament">
          <h3>🏆 Upcoming Tournament: {upcomingTournament.name}</h3>
          <p>⏰ Starts in: {getFormattedTimeLeft(timeUntilUpcoming)}</p>
        </div>
      )}

      <div className="top-layout">
        <BlockchainInfo
          isConnected={isConnected}
          chainId={chainId}
          identity={identity}
          applicationId={applicationId}
          error={error}
        />

        {gameSection}

        <Leaderboard
          displayLeaderboard={displayLeaderboard}
          isConnected={isConnected}
          isAdmin={isAdmin}
          onResetLeaderboard={resetLeaderboard}
          activeTournament={activeTournament}
        />
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        gameOver={gameOver}
        scoreDisplay={scoreDisplay}
        moves={moves}
        timeLeft={timeLeft}
        activeTournament={activeTournament}
        isConnected={isConnected}
        connectionTimeout={connectionTimeout}
        onResetGame={resetGame}
      />

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
