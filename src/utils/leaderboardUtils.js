import { getTournamentLeaderboard } from './tournamentUtils';

export const getRealLeaderboard = () => {
  const allUsers = [];

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('chainCrushUser_')) {
      try {
        const userData = JSON.parse(localStorage.getItem(key));
        if (userData && userData.totalScore > 0) {
          allUsers.push({
            playerId: userData.username,
            score: userData.totalScore,
            tokens: userData.totalScore,
            moves: userData.averageMoves || 0,
            gameTime: userData.averageTime || 0,
            gamesPlayed: userData.gamesPlayed || 0,
            totalScore: userData.totalScore || 0,
            timestamp: userData.lastPlayed || userData.lastLogin || userData.createdAt,
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  });

  return allUsers.sort((a, b) => b.totalScore - a.totalScore);
};

export const getDisplayLeaderboard = (leaderboard, currentUser, activeTournament = null) => {
  // If there's an active tournament (including grace period), show tournament leaderboard
  if (activeTournament) {
    const tournamentLeaderboard = getTournamentLeaderboard(activeTournament.id);
    const now = Date.now();
    const oneMinuteAfterEnd = 60 * 1000; // 1 minute in milliseconds
    const isGracePeriod =
      activeTournament.endDate <= now && activeTournament.endDate + oneMinuteAfterEnd > now;

    if (tournamentLeaderboard.length === 0) {
      return [
        {
          playerId: isGracePeriod
            ? 'Tournament ended - no participants'
            : 'No tournament entries yet',
          score: 0,
          tokens: 0,
          moves: 0,
          gameTime: 0,
          timestamp: Date.now(),
          isEmpty: true,
          isTournament: true,
          isGracePeriod: isGracePeriod,
        },
      ];
    }

    // Convert tournament leaderboard to match the expected format
    return tournamentLeaderboard.map((entry, index) => ({
      playerId: entry.username,
      score: entry.score,
      tokens: entry.score,
      moves: entry.moves || 0,
      gameTime: entry.gameTime || 0,
      gamesPlayed: 1,
      totalScore: entry.score,
      timestamp: entry.timestamp,
      rank: index + 1,
      isTournament: true,
      isGracePeriod: isGracePeriod,
    }));
  }

  // Show regular leaderboard when no tournament is active
  const realLeaderboard = getRealLeaderboard();

  if (realLeaderboard.length === 0) {
    return [
      {
        playerId: 'No players yet',
        score: 0,
        tokens: 0,
        moves: 0,
        gameTime: 0,
        timestamp: Date.now(),
        isEmpty: true,
      },
    ];
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
    averageMoves: Math.round(
      ((currentUser.averageMoves || 0) * (currentUser.gamesPlayed || 0) + totalMoves) /
        ((currentUser.gamesPlayed || 0) + 1)
    ),
    averageTime: Math.round(
      ((currentUser.averageTime || 0) * (currentUser.gamesPlayed || 0) + gameTime) /
        ((currentUser.gamesPlayed || 0) + 1)
    ),
    lastGameScore: finalScore,
    lastGameMoves: totalMoves,
    lastGameTime: gameTime,
  };

  localStorage.setItem('chainCrushUser', JSON.stringify(updatedUser));
  localStorage.setItem(`chainCrushUser_${currentUser.username}`, JSON.stringify(updatedUser));
  setCurrentUser(updatedUser);
};
