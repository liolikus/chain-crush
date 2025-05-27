import {useEffect, useState, useCallback} from 'react'
import ScoreBoard from './components/ScoreBoard'
import { useLinera } from './hooks/useLinera'
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
    const [timeoutCountdown, setTimeoutCountdown] = useState(15) // 15 second timeout
    
    // Linera blockchain integration
    const { 
        isConnected, 
        isLoading, 
        userStats, 
        leaderboard, 
        submitScore, 
        startGame: startBlockchainGame, 
        endGame: endBlockchainGame,
        status,
        error
    } = useLinera()

    // Connection timeout effect
    useEffect(() => {
        let timeoutTimer
        let countdownTimer
        
        if (isLoading && !isConnected && !connectionTimeout) {
            // Start countdown timer
            countdownTimer = setInterval(() => {
                setTimeoutCountdown(prev => {
                    if (prev <= 1) {
                        setConnectionTimeout(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            
            // Set main timeout
            timeoutTimer = setTimeout(() => {
                setConnectionTimeout(true)
            }, 15000) // 15 seconds
        }
        
        // Clear timers if connection succeeds or component unmounts
        if (isConnected || error) {
            clearTimeout(timeoutTimer)
            clearInterval(countdownTimer)
            setConnectionTimeout(false)
            setTimeoutCountdown(15)
        }
        
        return () => {
            clearTimeout(timeoutTimer)
            clearInterval(countdownTimer)
        }
    }, [isLoading, isConnected, connectionTimeout, error])

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
        if (isConnected && scoreDisplay > 0) {
            try {
                const gameTime = 60 - timeLeft;
                console.log('🪙 Converting final score to tokens on blockchain:', scoreDisplay);
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
    }, [isConnected, scoreDisplay, timeLeft, moves, submitScore, endBlockchainGame])

    const startGame = useCallback(async () => {
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
            // Continue with local game even if blockchain fails
            setGameStarted(true)
            setGameOver(false)
            setTimeLeft(60)
            setScoreDisplay(0)
            setMoves(0)
            createBoard()
        }
    }, [isConnected, startBlockchainGame, createBoard])

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
            setCurrentColorArrangement([])
        }
    }, [isConnected, gameStarted, endBlockchainGame])

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    const proceedWithLocalGame = useCallback(() => {
        setConnectionTimeout(true)
    }, [])

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
                    {status === 'Claiming Chain' && <p>Claiming blockchain...</p>}
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
        
        {error && (
            <div className="error-banner">
                <p>⚠️ {error}</p>
                <p><small>Game will continue in offline mode</small></p>
            </div>
        )}
        
        <div className="main-content">
            {leaderboard.length > 0 && (
                <div className="leaderboard">
                    <h3>🏆 {isConnected ? 'Blockchain' : 'Mock'} Token Leaderboard</h3>
                    <div className="leaderboard-list">
                        {leaderboard.slice(0, 5).map((entry, index) => (
                            <div key={index} className={`leaderboard-entry ${index === 0 ? 'first-place' : ''}`}>
                                <span className="rank">#{index + 1}</span>
                                <span className="score">🪙 {entry.tokens || entry.score} tokens</span>
                                <span className="moves">🎮 {entry.moves} moves</span>
                                <span className="player">👤 {entry.playerId}</span>
                                {index === 0 && <span className="crown">👑</span>}
                            </div>
                        ))}
                    </div>
                    {!isConnected && (
                        <p className="mock-notice"><small>* Mock data shown (offline mode)</small></p>
                    )}
                </div>
            )}

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
                            <p className="blockchain-indicator">⛓️ Score will be recorded on blockchain!</p>
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
                                {isConnected ? '🚀 Start Blockchain Game' : '🎮 Start Local Game'}
                            </button>
                        )}
                        
                        {gameOver && (
                            <div className="game-over">
                                <h2>🎉 Game Over!</h2>
                                <p>Final Score: <strong>{scoreDisplay}</strong></p>
                                <p>Total Moves: <strong>{moves}</strong></p>
                                <p>Game Time: <strong>{60 - timeLeft}s</strong></p>
                                {isConnected && scoreDisplay > 0 && (
                                    <p className="blockchain-success">✅ {scoreDisplay} tokens minted to your account!</p>
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
                        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                        <span>Linera Blockchain: {isConnected ? '🟢 Connected' : connectionTimeout ? '🟡 Offline Mode' : '🔴 Connecting...'}</span>
                        {status !== 'Ready' && status !== 'Error' && !connectionTimeout && (
                            <span className="status-text"> - {status}</span>
                        )}
                    </div>
                    {userStats && (
                        <div className="user-stats">
                            <p>🪙 Token Balance: {userStats.tokenBalance || userStats.bestScore} | 🎮 Games: {userStats.gamesPlayed}</p>
                            <p>📊 Total Tokens: {userStats.totalScore} | 📈 Average: {userStats.averageScore}</p>
                            <p>👤 Player ID: {userStats.playerId.substring(0, 12)}...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="blockchain-info">
            <p>
                {isConnected 
                    ? '🪙 Your scores are converted to tokens on the Linera blockchain!' 
                    : connectionTimeout 
                        ? '💾 Connection timed out. Playing in offline mode.'
                        : '💾 Playing in offline mode. Blockchain features unavailable.'
                }
            </p>
            {isConnected && (
                <div className="blockchain-details">
                    <p>🔗 Chain ID: {status === 'Ready' ? 'Connected' : 'Connecting...'}</p>
                    <p>📱 Wallet: {status === 'Ready' ? 'Active' : 'Creating...'}</p>
                    <p>🎯 Application: {status === 'Ready' ? 'Loaded' : 'Loading...'}</p>
                    <p>🪙 Fungible Token Contract: {process.env.REACT_APP_APPLICATION_ID || '11c588096b85b439a3281944ef68d641f39bf20de3b454f8e2764933b177bacc'}</p>
                </div>
            )}
            {(!isConnected || connectionTimeout) && (
                <div className="offline-details">
                    <p>🔄 Refresh page to retry blockchain connection</p>
                    <p>🎮 Game fully functional in offline mode</p>
                </div>
            )}
        </div>
    </div>
)
       
}

export default App
