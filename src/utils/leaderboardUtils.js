export const getRealLeaderboard = () => {
    const allUsers = [];
    
    // Get all users from localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chainCrushUser_')) {
            try {
                const userData = JSON.parse(localStorage.getItem(key));
                if (userData && userData.totalScore > 0) {
                    allUsers.push({
                        playerId: userData.username,
                        score: userData.totalScore,
                        tokens: userData.totalScore, // In offline mode, tokens = score
                        moves: userData.averageMoves || 0,
                        gameTime: userData.averageTime || 0,
                        gamesPlayed: userData.gamesPlayed || 0,
                        totalScore: userData.totalScore || 0,
                        timestamp: userData.lastPlayed || userData.lastLogin || userData.createdAt
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    });
    
    // Sort by total score (descending)
    return allUsers.sort((a, b) => b.totalScore - a.totalScore);
};

export const getDisplayLeaderboard = (leaderboard, currentUser) => {
    // Always use real leaderboard data, ignore blockchain leaderboard for now
    const realLeaderboard = getRealLeaderboard();
    
    // If no real users, show placeholder message
    if (realLeaderboard.length === 0) {
        return [{
            playerId: 'No players yet',
            score: 0,
            tokens: 0,
            moves: 0,
            gameTime: 0,
            timestamp: Date.now(),
            isEmpty: true
        }];
    }
    
    return realLeaderboard;
};

export const updateUserStats = (currentUser, finalScore, gameTime, totalMoves, setCurrentUser) => {
    if (!currentUser) return;

    const updatedUser = {
        ...currentUser,
        gamesPlayed: (currentUser.gamesPlayed || 0) + 1,
        totalScore: (currentUser.totalScore || 0) + finalScore,
        bestScore: Math.max(currentUser.bestScore || 0, finalScore),
        lastPlayed: Date.now(),
        // Add average calculations
        averageMoves: Math.round((((currentUser.averageMoves || 0) * (currentUser.gamesPlayed || 0)) + totalMoves) / ((currentUser.gamesPlayed || 0) + 1)),
        averageTime: Math.round((((currentUser.averageTime || 0) * (currentUser.gamesPlayed || 0)) + gameTime) / ((currentUser.gamesPlayed || 0) + 1)),
        // Track last game stats
        lastGameScore: finalScore,
        lastGameMoves: totalMoves,
        lastGameTime: gameTime
    };

    // Save to both current session and permanent user storage
    localStorage.setItem('chainCrushUser', JSON.stringify(updatedUser));
    localStorage.setItem(`chainCrushUser_${currentUser.username}`, JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    
    console.log('📊 User stats updated:', updatedUser);
};
