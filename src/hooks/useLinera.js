import { useState, useEffect, useCallback } from 'react';
import lineraService from '../services/lineraService';

export const useLinera = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(lineraService.getMockLeaderboard()); // Initialize with mock data
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Loading');

  const updateStatus = useCallback(async (newStatus) => {
    console.log('🔄 Status update:', newStatus);
    setStatus(newStatus);
    
    // If we reach Ready status, stop loading and clear any errors
    if (newStatus === 'Ready') {
      console.log('✅ Setting isLoading to false and isConnected to true');
      setIsLoading(false);
      setIsConnected(true);
      setError(null); // Clear any previous errors
    }
    
    // Add a small delay to ensure React processes the state update
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  const loadUserDataInBackground = useCallback(async () => {
    try {
      console.log('📊 Loading user data from blockchain in background...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User data loading timeout')), 3000)
      );
      
      const dataPromise = Promise.all([
        lineraService.getUserStats(),
        lineraService.getLeaderboard()
      ]);
      
      const [stats, leaderboardData] = await Promise.race([dataPromise, timeoutPromise]);
      
      setUserStats(stats);
      setLeaderboard(leaderboardData);
      
      console.log('✅ User data loaded successfully in background', { stats, leaderboardData });
    } catch (error) {
      console.warn('Failed to load user data in background (using defaults):', error);
      setUserStats(lineraService.getDefaultStats());
      setLeaderboard(lineraService.getMockLeaderboard());
    }
  }, []);

const initializeLinera = useCallback(async () => {
    console.log('🚀 Starting Linera initialization...');
    setIsLoading(true);
    setIsConnected(false);
    setError(null); // Clear any previous errors at start
    
    try {
        console.log('🔗 Initializing Linera connection...');
        
        // Add a timeout to prevent hanging
        const initializationPromise = lineraService.initializeWithStatusUpdates(updateStatus);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Initialization timeout after 30 seconds')), 30000)
        );
        
        const success = await Promise.race([initializationPromise, timeoutPromise]);
        
        console.log('🔍 Initialization result:', success);
        console.log('🔍 Service isInitialized:', lineraService.isInitialized);
        
        if (success) {
            console.log('✅ Linera connected successfully!');
            
            // Set these states explicitly and clear error
            setIsConnected(true);
            setIsLoading(false);
            setError(null); // Explicitly clear error on success
            setStatus('Ready');
            
            // Set default data immediately
            setUserStats(lineraService.getDefaultStats());
            setLeaderboard(lineraService.getMockLeaderboard());
            
            // Load user data in the background
            setTimeout(() => {
                loadUserDataInBackground();
            }, 1000);
            
        } else {
            console.log('❌ Linera connection failed, using offline mode');
            setIsConnected(false);
            setIsLoading(false);
            setStatus('Error');
            setError('Connection failed - using offline mode');
            setUserStats(lineraService.getDefaultStats());
            setLeaderboard(lineraService.getMockLeaderboard());
        }
    } catch (error) {
        console.error('Linera initialization failed:', error);
        setError('Try refresh: ' + error.message);
        setIsConnected(false);
        setIsLoading(false);
        setStatus('Error');
        setUserStats(lineraService.getDefaultStats());
        setLeaderboard(lineraService.getMockLeaderboard());
    }
}, [updateStatus, loadUserDataInBackground]);

  // Debug effect to track all state changes
  useEffect(() => {
    console.log('🔍 useLinera state changed:', { 
      isConnected, 
      isLoading, 
      status, 
      error,
      serviceInitialized: lineraService.isInitialized 
    });
  }, [isConnected, isLoading, status, error]);

  const loadUserData = useCallback(async () => {
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
      
      setTimeout(() => {
        loadUserDataInBackground().catch(error => {
          console.warn('Failed to reload user data after score submission:', error);
        });
      }, 500);
      
      return result;
      
    } catch (error) {
      console.error('Failed to submit score:', error);
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
    wallet: lineraService.getWallet(),
    client: lineraService.getClient(),
    chainId: lineraService.getChainId(),
    identity: lineraService.getIdentity(),
    applicationId: lineraService.applicationId,
    application: lineraService.getApplication(),
    accountOwner: lineraService.getAccountOwner()
  };
};
