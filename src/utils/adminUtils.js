// Admin utility functions
export const ADMIN_USERNAMES = ['admin', 'moderator', 'chaincrush_admin'];

export const checkIsAdmin = (username) => {
  return ADMIN_USERNAMES.includes(username.trim().toLowerCase());
};

export const resetLeaderboardData = (currentUser, setCurrentUser) => {
  Object.keys(localStorage).forEach((key) => {
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

  if (currentUser) {
    const resetUser = {
      ...currentUser,
      bestScore: 0,
      totalScore: 0,
      gamesPlayed: 0,
      averageMoves: 0,
      averageTime: 0,
    };
    setCurrentUser(resetUser);
    localStorage.setItem('chainCrushUser', JSON.stringify(resetUser));
  }

  return true;
};
