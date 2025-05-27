import { useState, useEffect, useCallback } from 'react';
import lineraService from '../services/lineraService';

export const useLinera = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Loading');

  const updateStatus = useCallback(async (newStatus) => {
    console.log('Status update:', newStatus);
    setStatus(newStatus);
    
    // If we reach Ready status, stop loading
    if (newStatus === 'Ready') {
      setIsLoading(false);
    }
    
    // Add a small delay to ensure React processes the state update
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  const loadUserDataInBackground = useCallback(async () => {
    try {
      console.log('📊 Loading user data from blockchain in background...');
      
      // Set a shorter timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User data loading timeout')), 3000)
      );
      
      const dataPromise = Promise.all([
        lineraService.getUserStats(),
        lineraService.getLeaderboard()
      ]);
      
      const [stats, leaderboardData] = await Promise.race([dataPromise, timeoutPromise]);
      
      // Always update with the returned data
      setUserStats(stats);
      setLeaderboard(leaderboardData);
      
      console.log('✅ User data loaded successfully in background', { stats, leaderboardData });
    } catch (error) {
      console.warn('Failed to load user data in background (using defaults):', error);
      // Set default data on error
      setUserStats(lineraService.getDefaultStats());
      setLeaderboard(lineraService.getMockLeaderboard());
    }
  }, []);

  const initializeLinera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔗 Initializing Linera connection...');
      
      // Initialize with status updates
      const success = await lineraService.initializeWithStatusUpdates(updateStatus);
      setIsConnected(success);
      
      if (success) {
        console.log('✅ Linera connected successfully!');
        
        // Set default data immediately
        setUserStats(lineraService.getDefaultStats());
        setLeaderboard(lineraService.getMockLeaderboard());
        
        // Ensure we're marked as ready and not loading
        await updateStatus('Ready');
        setIsLoading(false);
        
        // Load user data in the background (non-blocking)
        setTimeout(() => {
          loadUserDataInBackground();
        }, 1000);
        
      } else {
        await updateStatus('Error');
        console.log('❌ Linera connection failed, using offline mode');
        // Set default data for offline mode
        setUserStats(lineraService.getDefaultStats());
        setLeaderboard(lineraService.getMockLeaderboard());
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Linera initialization failed:', error);
      setError('Failed to connect to Linera network: ' + error.message);
      setIsConnected(false);
      await updateStatus('Error');
      // Set default data on error
      setUserStats(lineraService.getDefaultStats());
      setLeaderboard(lineraService.getMockLeaderboard());
      setIsLoading(false);
    }
  }, [updateStatus, loadUserDataInBackground]);

  const loadUserData = useCallback(async () => {
    // This is for manual refresh - can be blocking
    try {
      console.log('📊 Manually refreshing user data...');
      const [stats, leaderboardData] = await Promise.all([
        lineraService.getUserStats(),
        lineraService.getLeaderboard()
      ]);
      
      setUserStats(stats);
      setLeaderboard(leaderboardData);
      console.log('✅ User data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Keep existing data on refresh failure
    }
  }, []);

  const startGame = useCallback(async () => {
    try {
      setError(null);
      console.log('🎮 Starting game on Linera blockchain...');
      const result = await lineraService.startGame();
      console.log('✅ Game started on blockchain:', result);
      return true;
    } catch (error) {
      console.error('Failed to start game on blockchain:', error);
      setError('Failed to start game on blockchain');
      return false;
    }
  }, []);

  const submitScore = useCallback(async (score, gameTime, moves) => {
    try {
      setError(null);
      console.log('🪙 Submitting score to blockchain as tokens:', score);
      const result = await lineraService.submitScore(score, gameTime, moves);
      
      console.log('✅ Score submission result:', result);
      
      // Reload data after score submission (but don't wait for it)
      setTimeout(() => {
        loadUserDataInBackground().catch(error => {
          console.warn('Failed to reload user data after score submission:', error);
        });
      }, 500);
      
      return result;
      
    } catch (error) {
      console.error('Failed to submit score:', error);
      // Don't show error to user, just log it
      console.log('Score submission failed, but game continues normally');
      return { success: true, mock: true, error: error.message };
    }
  }, [loadUserDataInBackground]);

  const endGame = useCallback(async () => {
    try {
      setError(null);
      console.log('🏁 Ending game on Linera blockchain...');
      const result = await lineraService.endGame();
      console.log('✅ Game ended on blockchain:', result);
      return true;
    } catch (error) {
      console.error('Failed to end game on blockchain:', error);
      setError('Failed to end game on blockchain');
      return false;
    }
  }, []);

  useEffect(() => {
    initializeLinera();
  }, [initializeLinera]);

  return {
    isConnected,
    isLoading,
    userStats,
    leaderboard,
    error,
    status,
    startGame,
    submitScore,
    endGame,
    refreshData: loadUserData,
    retry: initializeLinera,
    // Expose Linera objects for advanced usage
    wallet: lineraService.getWallet(),
    client: lineraService.getClient(),
    chainId: lineraService.getChainId(),
    application: lineraService.getApplication(),
    accountOwner: lineraService.getAccountOwner()
  };
};
