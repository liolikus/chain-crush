import {useEffect, useState, useCallback, useMemo} from 'react'
import ScoreBoard from './components/ScoreBoard'
import { useLinera } from './hooks/useLinera'
import { validateLoginInput, authenticateUser, saveUserSession, loadSavedSession, clearUserSession } from './utils/authUtils'
import { resetLeaderboardData } from './utils/adminUtils'
import { getDisplayLeaderboard, updateUserStats } from './utils/leaderboardUtils'
import blueCandy from './images/blue-candy.png'
import greenCandy from './images/green-candy.png'
import orangeCandy from './images/orange-candy.png'
import purpleCandy from './images/purple-candy.png'
import redCandy from './images/red-candy.png'
import yellowCandy from './images/yellow-candy.png'
import blank from './images/blank.png'

const width = 8
const candyColors = [
    blueCandy,
    orangeCandy,
    purpleCandy,
    redCandy,
    yellowCandy,
    greenCandy
]


const ADMIN_USERNAMES = ['admin', 'moderator', 'chaincrush_admin']

const App = () => {
    const [currentColorArrangement, setCurrentColorArrangement] = useState([])
    const [squareBeingDragged, setSquareBeingDragged] = useState(null)
    const [squareBeingReplaced, setSquareBeingReplaced] = useState(null)
    const [scoreDisplay, setScoreDisplay] = useState(0)
    const [timeLeft, setTimeLeft] = useState(60)
    const [gameOver, setGameOver] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [moves, setMoves] = useState(0)
    const [connectionTimeout, setConnectionTimeout] = useState(false)
    const [timeoutCountdown, setTimeoutCountdown] = useState(60)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    
    // Linera blockchain integration
    const { 
        isConnected, 
        isLoading, 
        // userStats, //disabled till integration
        leaderboard, 
        submitScore, 
        startGame: startBlockchainGame, 
        endGame: endBlockchainGame,
        status,
        error,
        chainId,
        identity,
        applicationId
    } = useLinera()

    // Replace the displayLeaderboard line with:
    const displayLeaderboard = useMemo(() => {
        return getDisplayLeaderboard(leaderboard);
    }, [leaderboard]);

    // Replace the existing useEffect that checks for saved login
    useEffect(() => {
        const { userData, credentials } = loadSavedSession();
        
        if (userData) {
            setCurrentUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(userData.isAdmin || false);
        }
        
        if (credentials) {
            setUsername(credentials.username);
            setPassword(credentials.password);
        }
    }, []);

    // Login function
    const handleLogin = useCallback((e) => {
        e.preventDefault();
        setLoginError('');

        const validationError = validateLoginInput(username, password);
        if (validationError) {
            setLoginError(validationError);
            return;
        }

        try {
            const { userData, isUserAdmin } = authenticateUser(username, password);
            saveUserSession(userData);

            setCurrentUser(userData);
            setIsLoggedIn(true);
            setIsAdmin(isUserAdmin);
            setShowLogin(false);
        } catch (error) {
            setLoginError(error.message);
        }
    }, [username, password]);

    // Logout function
    const handleLogout = useCallback(() => {
        clearUserSession();
        setCurrentUser(null);
        setIsLoggedIn(false);
        setIsAdmin(false);
        setShowAdminPanel(false);
        setGameStarted(false);
        setGameOver(false);
        setScoreDisplay(0);
        setMoves(0);
        setTimeLeft(60);
    }, []);

    // Update user stats after game
    const updateUserStats = useCallback((finalScore, gameTime, totalMoves) => {
        if (!currentUser) return;

        const updatedUser = {
            ...currentUser,
            gamesPlayed: currentUser.gamesPlayed + 1,
            totalScore: currentUser.totalScore + finalScore,
            bestScore: Math.max(currentUser.bestScore, finalScore),
            lastPlayed: Date.now(),
            // Add average calculations
            averageMoves: Math.round(((currentUser.averageMoves || 0) * (currentUser.gamesPlayed || 0) + totalMoves) / (currentUser.gamesPlayed + 1)),
            averageTime: Math.round(((currentUser.averageTime || 0) * (currentUser.gamesPlayed || 0) + gameTime) / (currentUser.gamesPlayed + 1)),
            // Track last game stats
            lastGameScore: finalScore,
            lastGameMoves: totalMoves,
            lastGameTime: gameTime
        };

        // Save to both current session and permanent user storage
        localStorage.setItem('chainCrushUser', JSON.stringify(updatedUser));
        localStorage.setItem(`chainCrushUser_${currentUser.username}`, JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
    }, [currentUser])

    useEffect(() => {
        console.log('🔍 App.js received from useLinera:', { 
            isConnected, 
            isLoading, 
            status, 
            error,
            connectionTimeout 
        });
    }, [isConnected, isLoading, status, error, connectionTimeout]);

    // Effect to handle successful connection
    useEffect(() => {
        if (isConnected && !isLoading) {
            setConnectionTimeout(false);
            setTimeoutCountdown(60);
        }
    }, [isConnected, isLoading]);

    // Effect to handle connection timeout
    useEffect(() => {
        let timeoutTimer;
        let countdownTimer;
        
        // Only start timeout if we're loading, not connected, and haven't timed out yet
        if (isLoading && !isConnected && !connectionTimeout) {
            // Start countdown timer
            countdownTimer = setInterval(() => {
                setTimeoutCountdown(prev => {
                    if (prev <= 1) {
                        setConnectionTimeout(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            // Set main timeout
            timeoutTimer = setTimeout(() => {
                setConnectionTimeout(true);
            }, 60000);
        }
        
        return () => {
            clearTimeout(timeoutTimer);
            clearInterval(countdownTimer);
        };
    }, [isLoading, isConnected, connectionTimeout]);

    const checkForColumnOfFour = useCallback(() => {
        for (let i = 0; i <= 39; i++) {
            const columnOfFour = [i, i + width, i + width * 2, i + width * 3]
            const decidedColor = currentColorArrangement[i]
            const isBlank = currentColorArrangement[i] === blank

            if (columnOfFour.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 4)
                columnOfFour.forEach(square => currentColorArrangement[square] = blank)
                return true
            }
        }
    }, [currentColorArrangement])

    const checkForRowOfFour = useCallback(() => {
        for (let i = 0; i < 64; i++) {
            const rowOfFour = [i, i + 1, i + 2, i + 3]
            const decidedColor = currentColorArrangement[i]
            const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 62, 63, 64]
            const isBlank = currentColorArrangement[i] === blank

            if (notValid.includes(i)) continue

            if (rowOfFour.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 4)
                rowOfFour.forEach(square => currentColorArrangement[square] = blank)
                return true
            }
        }
    }, [currentColorArrangement])

    const checkForColumnOfThree = useCallback(() => {
        for (let i = 0; i <= 47; i++) {
            const columnOfThree = [i, i + width, i + width * 2]
            const decidedColor = currentColorArrangement[i]
            const isBlank = currentColorArrangement[i] === blank

            if (columnOfThree.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 3)
                columnOfThree.forEach(square => currentColorArrangement[square] = blank)
                return true
            }
        }
    }, [currentColorArrangement])

    const checkForRowOfThree = useCallback(() => {
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2]
            const decidedColor = currentColorArrangement[i]
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63, 64]
            const isBlank = currentColorArrangement[i] === blank

            if (notValid.includes(i)) continue

            if (rowOfThree.every(square => currentColorArrangement[square] === decidedColor && !isBlank)) {
                setScoreDisplay((score) => score + 3)
                rowOfThree.forEach(square => currentColorArrangement[square] = blank)
                return true
            }
        }
    }, [currentColorArrangement])

    const moveIntoSquareBelow = useCallback(() => {
        for (let i = 0; i <= 55; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7]
            const isFirstRow = firstRow.includes(i)

            if (isFirstRow && currentColorArrangement[i] === blank) {
                let randomNumber = Math.floor(Math.random() * candyColors.length)
                currentColorArrangement[i] = candyColors[randomNumber]
            }

            if ((currentColorArrangement[i + width]) === blank) {
                currentColorArrangement[i + width] = currentColorArrangement[i]
                currentColorArrangement[i] = blank
            }
        }
    }, [currentColorArrangement])

    const dragStart = useCallback((e) => {
        if (gameOver || !gameStarted) return
        setSquareBeingDragged(e.target)
    }, [gameOver, gameStarted])
    
    const dragDrop = useCallback((e) => {
        if (gameOver || !gameStarted) return
        setSquareBeingReplaced(e.target)
    }, [gameOver, gameStarted])
    
    const dragEnd = useCallback(() => {
        if (gameOver || !gameStarted) return
        
        const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute('data-id'))
        const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute('data-id'))

        currentColorArrangement[squareBeingReplacedId] = squareBeingDragged.getAttribute('src')
        currentColorArrangement[squareBeingDraggedId] = squareBeingReplaced.getAttribute('src')

        const validMoves = [
            squareBeingDraggedId - 1,
            squareBeingDraggedId - width,
            squareBeingDraggedId + 1,
            squareBeingDraggedId + width
        ]

        const validMove = validMoves.includes(squareBeingReplacedId)

        const isAColumnOfFour = checkForColumnOfFour()
        const isARowOfFour = checkForRowOfFour()
        const isAColumnOfThree = checkForColumnOfThree()
        const isARowOfThree = checkForRowOfThree()

        if (squareBeingReplacedId &&
            validMove &&
            (isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree)) {
            setSquareBeingDragged(null)
            setSquareBeingReplaced(null)
            setMoves(prev => prev + 1)
        } else {
            currentColorArrangement[squareBeingReplacedId] = squareBeingReplaced.getAttribute('src')
            currentColorArrangement[squareBeingDraggedId] = squareBeingDragged.getAttribute('src')
            setCurrentColorArrangement([...currentColorArrangement])
        }
    }, [gameOver, gameStarted, squareBeingDragged, squareBeingReplaced, currentColorArrangement, checkForColumnOfFour, checkForRowOfFour, checkForColumnOfThree, checkForRowOfThree])

    const createBoard = useCallback(() => {
        const randomColorArrangement = []
        for (let i = 0; i < width * width; i++) {
            const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
            randomColorArrangement.push(randomColor)
        }
        setCurrentColorArrangement(randomColorArrangement)
    }, [])

    const handleGameOver = useCallback(async () => {
        const gameTime = 60 - timeLeft;
        
        // Update user stats with detailed info
        updateUserStats(scoreDisplay, gameTime, moves);

        if (isConnected && scoreDisplay > 0) {
            try {
                const expectedTokens = Math.floor(scoreDisplay / 10);
                console.log('🪙 Converting score to tokens on blockchain:', {
                    score: scoreDisplay,
                    expectedTokens,
                    ratio: '10:1'
                });
                const result = await submitScore(scoreDisplay, gameTime, moves);
                
                if (result.success && !result.mock) {
                    console.log('✅ Tokens minted successfully!', result);
                } else if (result.mock) {
                    console.log('⚠️ Token minting used mock mode due to blockchain issues');
                }
                
                await endBlockchainGame()
                console.log('✅ Game session ended on blockchain!')
            } catch (error) {
                console.error('Failed to mint tokens for score:', error);
                // Don't show error to user, game continues normally
            }
        }
    }, [isConnected, scoreDisplay, timeLeft, moves, submitScore, endBlockchainGame, updateUserStats])

    const startGame = useCallback(async () => {
        if (!isLoggedIn) {
            setShowLogin(true)
            return
        }

        try {
            if (isConnected) {
                console.log('Starting game on Linera blockchain...')
                await startBlockchainGame()
                console.log('✅ Game started on blockchain!')
            }
            
            setGameStarted(true)
            setGameOver(false)
            setTimeLeft(60)
            setScoreDisplay(0)
            setMoves(0)
            createBoard()
        } catch (error) {
            console.error('Failed to start game on blockchain:', error)
            setGameStarted(true)
            setGameOver(false)
            setTimeLeft(60)
            setScoreDisplay(0)
            setMoves(0)
            createBoard()
        }
    }, [isLoggedIn, isConnected, startBlockchainGame, createBoard])

    const resetGame = useCallback(async () => {
        try {
            if (isConnected && gameStarted) {
                console.log('Ending game on Linera blockchain...')
                await endBlockchainGame()
                console.log('✅ Game ended on blockchain!')
            }
        } catch (error) {
            console.error('Failed to end game on blockchain:', error)
        } finally {
            setGameStarted(false)
            setGameOver(false)
            setTimeLeft(60)
            setScoreDisplay(0)
            setMoves(0)
            createBoard()
        }
    }, [isConnected, gameStarted, endBlockchainGame, createBoard])

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    const proceedWithLocalGame = useCallback(() => {
        setConnectionTimeout(true)
    }, [])

    const resetLeaderboard = useCallback(() => {
        if (!isAdmin) return;
        
        if (window.confirm('Are you sure you want to reset the leaderboard? This will clear all user scores but keep accounts.')) {
            // Reset all user scores
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('chainCrushUser_')) {
                    try {
                        const userData = JSON.parse(localStorage.getItem(key));
                        if (userData) {
                            userData.bestScore = 0;
                            userData.totalScore = 0;
                            userData.gamesPlayed = 0;
                            userData.averageMoves = 0;
                            userData.averageTime = 0;
                            localStorage.setItem(key, JSON.stringify(userData));
                        }
                    } catch (error) {
                        console.error('Error resetting user data:', error);
                    }
                }
            });
            
            // Update current user if logged in
            if (currentUser) {
                const resetUser = {
                    ...currentUser,
                    bestScore: 0,
                    totalScore: 0,
                    gamesPlayed: 0,
                    averageMoves: 0,
                    averageTime: 0
                };
                setCurrentUser(resetUser);
                localStorage.setItem('chainCrushUser', JSON.stringify(resetUser));
            }
            
            console.log('🔧 Admin: Leaderboard reset completed');
            alert('Leaderboard has been reset! All scores cleared but user accounts preserved.');
        }
    }, [isAdmin, currentUser])

    const toggleAdminPanel = useCallback(() => {
        if (!isAdmin) return
        setShowAdminPanel(prev => !prev)
    }, [isAdmin])

    // Timer effect
    useEffect(() => {
        let timer
        if (gameStarted && !gameOver && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        setGameOver(true)
                        handleGameOver()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [gameStarted, gameOver, timeLeft, handleGameOver])

    useEffect(() => {
        createBoard()
    }, [createBoard])

    useEffect(() => {
        if (!gameStarted || gameOver) return
        
        const timer = setInterval(() => {
            checkForColumnOfFour()
            checkForRowOfFour()
            checkForColumnOfThree()
            checkForRowOfThree()
            moveIntoSquareBelow()
            setCurrentColorArrangement([...currentColorArrangement])
        }, 100)
        return () => clearInterval(timer)
    }, [checkForColumnOfFour, checkForRowOfFour, checkForColumnOfThree, checkForRowOfThree, moveIntoSquareBelow, currentColorArrangement, gameStarted, gameOver])

    return (
        <div className="app">
        {isLoading && !connectionTimeout && (
            <div className="loading">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p>🔗 {status}...</p>
                    {status === 'Loading WASM' && <p>Loading Linera WebAssembly...</p>}
                    {status === 'Creating Faucet' && <p>Connecting to faucet...</p>}
                    {status === 'Creating Wallet' && <p>Creating blockchain wallet...</p>}
                    {status === 'Creating Client' && <p>Setting up client...</p>}
                    {status === 'Claiming Chain' && <p>Connecting to Microchain...</p>}
                    {status === 'Loading Application' && <p>Loading application...</p>}
                    {status === 'Loading User Data' && <p>Loading user data...</p>}
                    <div className="timeout-info">
                        <p>⏱️ Connection timeout in {timeoutCountdown}s</p>
                        <button onClick={proceedWithLocalGame} className="skip-btn">
                            🎮 Play Locally Now
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {error && !isConnected && (
            <div className="error-banner">
                <p>⚠️ {error}</p>
                <p><small>Game will continue in offline mode</small></p>
            </div>
        )}
        
        {/* Login Modal */}
        {showLogin && (
            <div className="login-overlay">
                <div className="login-modal">
                    <div className="login-header">
                        <h2>🎮 Login to Chain Crush</h2>
                        <button 
                            className="close-btn"
                            onClick={() => setShowLogin(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">👤 Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">🔒 Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    readOnly
                                />
                                <span className="checkmark"></span>
                                🔒 Remember my login (always enabled)
                            </label>
                        </div>
                        {loginError && (
                            <div className="login-error">
                                ⚠️ {loginError}
                            </div>
                        )}
                        <button type="submit" className="login-btn">
                            🚀 Login & Play
                        </button>
                        <p className="login-note">
                            <small>No registration required - just create a username and password!</small>
                            <small>Your login and stats will be remembered automatically</small>
                        </p>
                    </form>
                </div>
            </div>
        )}

        {/* User info bar */}
        {isLoggedIn && (
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
                <button onClick={handleLogout} className="logout-btn">
                    🚪 Logout
                </button>
            </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
            <>
                {!showAdminPanel ? (
                    <button 
                        onClick={toggleAdminPanel}
                        className="admin-toggle"
                        title="Admin Panel"
                    >
                        ⚙️
                    </button>
                ) : (
                    <div className="admin-controls">
                        <div className="admin-header">
                            <h3>Admin Panel</h3>
                            <button 
                                onClick={toggleAdminPanel}
                                className="close-btn"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="admin-actions">
                            <button 
                                onClick={resetLeaderboard}
                                className="admin-btn danger"
                            >
                                🗑️ Reset Leaderboard
                            </button>
                            <div className="admin-info">
                                <p><small>🔧 Admin Mode Active</small></p>
                                <p><small>Chain: {isConnected ? 'Connected' : 'Offline'}</small></p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* Top row layout: blockchain-info left, game center, leaderboard right */}
        <div className="top-layout">
            {/* Blockchain info - top left */}
            <div className="blockchain-info">
                <p>
                    {isConnected 
                        ? 'Your scores are converted to tokens on the Linera Microchains!' 
                        : connectionTimeout 
                            ? '💾 Connection timed out. Playing in offline mode.'
                            : '💾 Playing in offline mode. Blockchain features unavailable.'
                    }
                </p>
                {isConnected && (
                    <div className="blockchain-details">
                        <p>🔗 Chain ID: {chainId || 'Loading...'}</p>
                        <p>📱 Wallet: {identity || 'Loading...'}</p>
                        <p>🎯 Application: {applicationId || 'Loading...'}</p>
                    </div>
                )}
                {(!isConnected || connectionTimeout) && (
                    <div className="offline-details">
                        <p>🔄 Refresh page to retry blockchain connection</p>
                        <p>🎮 Game fully functional in offline mode</p>
                    </div>
                )}
            </div>

            {/* Game container - top center */}
            <div className="game-container">
                <div className={`game ${gameOver ? 'game-disabled' : ''}`}>
                    {currentColorArrangement.map((candyColor, index) => (
                        <img
                            key={index}
                            src={candyColor}
                            alt={candyColor}
                            data-id={index}
                            draggable={!gameOver && gameStarted}
                            onDragStart={dragStart}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={dragDrop}
                            onDragEnd={dragEnd}
                            style={{ 
                                opacity: gameOver ? 0.5 : 1,
                                pointerEvents: (!gameStarted || gameOver) ? 'none' : 'auto',
                                transition: 'opacity 0.3s ease'
                            }}
                        />
                    ))}
                </div>

                <div className="game-header">
                    <div className="timer">
                        <h3>⏰ Time: {formatTime(timeLeft)}</h3>
                        <p>🎯 Moves: {moves}</p>
                        {isConnected && gameStarted && (
                            <p className="blockchain-indicator">⛓️ Score will be recorded on microchain!</p>
                        )}
                        {(!isConnected || connectionTimeout) && gameStarted && (
                            <p className="offline-indicator">💾 Playing in offline mode</p>
                        )}
                    </div>
                    
                    <ScoreBoard score={scoreDisplay}/>
                    
                    <div className="game-controls">
                        {!gameStarted && !gameOver && (
                            <button 
                                onClick={startGame} 
                                className="start-btn" 
                                disabled={isLoading && !connectionTimeout}
                            >
                                {isLoggedIn 
                                    ? (isConnected ? '⛓️ Start Microchain Game' : '🎮 Start Local Game')
                                    : '🔐 Login to Play'
                                }
                            </button>
                        )}
                        
                        {gameOver && (
                            <div className="game-over">
                                <h2>🎉 Game Over!</h2>
                                <p>Final Score: <strong>{scoreDisplay}</strong></p>
                                <p>Total Moves: <strong>{moves}</strong></p>
                                <p>Game Time: <strong>{60 - timeLeft}s</strong></p>
                                {isConnected && scoreDisplay > 0 && (
                                    <div className="token-conversion">
                                        <p className="blockchain-success">
                                            ✅ {Math.floor(scoreDisplay / 10)} tokens minted to your account!
                                        </p>
                                        <p><small>Conversion rate: 10 points = 1 token</small></p>
                                    </div>
                                )}
                                {(!isConnected || connectionTimeout) && (
                                    <p className="offline-notice">💾 Score saved locally (offline mode)</p>
                                )}
                                <button onClick={resetGame} className="restart-btn">
                                    🔄 Play Again
                                </button>
                            </div>
                        )}
                        
                        {gameStarted && !gameOver && (
                            <button onClick={resetGame} className="reset-btn">
                                🛑 End Game
                            </button>
                        )}
                    </div>
                </div>

                <div className="blockchain-status">
                    <div className="status-indicator">
                        <span className={`status-dot ${isConnected && !isLoading ? 'connected' : 'disconnected'}`}></span>
                        <span>
                            Linera Microchain: {
                                isConnected && !isLoading 
                                    ? '🟢 Connected' 
                                    : connectionTimeout 
                                        ? '🟡 Offline Mode' 
                                        : '🔴 Connecting...'
                            }
                        </span>
                        {status !== 'Ready' && status !== 'Error' && !connectionTimeout && (
                            <span className="status-text"> - {status}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Leaderboard - top right - ALWAYS SHOW */}
            <div className={`leaderboard ${isAdmin ? 'admin-mode' : ''}`}>
                <h3>🏆 {isConnected ? 'Microchain' : 'Local'} Leaderboard</h3>
                <div className="leaderboard-list">
                    {displayLeaderboard.slice(0, 5).map((entry, index) => (
                        <div key={index} className={`leaderboard-entry ${index === 0 && !entry.isEmpty ? 'first-place' : ''} ${entry.isEmpty ? 'empty-entry' : ''}`}>
                            {entry.isEmpty ? (
                                <>
                                    <span className="empty-message">🎮 Play your first game to appear on the leaderboard!</span>
                                </>
                            ) : (
                                <>
                                    <span className="rank">#{index + 1}</span>
                                    <span className="score">🪙 {entry.tokens || entry.score}</span>
                                    <span className="moves">🎮 {entry.moves}m</span>
                                    <span className="player">👤 {entry.playerId}</span>
                                    {index === 0 && <span className="crown">👑</span>}
                                </>
                            )}
                        </div>
                    ))}
                </div>
                {!isConnected && displayLeaderboard.length > 0 && !displayLeaderboard[0].isEmpty && (
                    <p className="local-notice"><small>* Local leaderboard (offline mode)</small></p>
                )}
                {isAdmin && (
                    <div className="admin-leaderboard-actions">
                        <button 
                            onClick={resetLeaderboard}
                            className="admin-leaderboard-btn"
                        >
                            🗑️ Reset
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Game Over Popup */}
        {gameOver && (
            <div className="game-over-overlay">
                <div className="game-over-popup">
                    <h2>🎉 Game Over!</h2>
                    <p>Final Score: <strong>{scoreDisplay}</strong></p>
                    <p>Total Moves: <strong>{moves}</strong></p>
                    <p>Game Time: <strong>{60 - timeLeft}s</strong></p>
                    {isConnected && scoreDisplay > 0 && (
                        <div className="token-conversion">
                            <p className="blockchain-success">
                                ✅ {Math.floor(scoreDisplay / 10)} tokens minted to your account!
                            </p>
                            <p><small>Conversion rate: 10 points = 1 token</small></p>
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

        {/* Linera Logo - bottom left */}
        <div className="linera-logo">
            <img src="/Linera_Red_H.svg" alt="Linera" />
        </div>
    </div>
)
       
}

export default App
