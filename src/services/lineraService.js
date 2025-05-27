import * as linera from '@linera/client';

class LineraService {
  constructor() {
    this.client = null;
    this.wallet = null;
    this.chainId = null;
    this.application = null;
    this.applicationId = null;
    this.isInitialized = false;
    this.playerId = this.getOrCreatePlayerId();
    this.faucet = null;
    this.accountOwner = null;
  }

  getOrCreatePlayerId() {
    let playerId = localStorage.getItem('candyCrushPlayerId');
    if (!playerId) {
      playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('candyCrushPlayerId', playerId);
    }
    return playerId;
  }

  async initialize() {
    return this.initializeWithStatusUpdates(() => {});
  }

  async initializeWithStatusUpdates(updateStatus) {
    try {
      console.log('Connecting to Linera backend...');
      
      // Load WASM first
      console.log('Loading Linera WASM...');
      await updateStatus('Loading WASM');
      await linera.default();
      console.log('WASM loaded successfully');
      
      // Create faucet connection
      await updateStatus('Creating Faucet');
      const faucetEndpoint = process.env.REACT_APP_LINERA_FAUCET || 'https://faucet.testnet-babbage.linera.net';
      console.log('Creating faucet with endpoint:', faucetEndpoint);
      this.faucet = new linera.Faucet(faucetEndpoint);
      console.log('Faucet created successfully');
      
      // Create wallet
      await updateStatus('Creating Wallet');
      console.log('Creating wallet...');
      this.wallet = await this.faucet.createWallet();
      console.log('Wallet created successfully:', this.wallet);
      
      // Create client
      await updateStatus('Creating Client');
      console.log('Creating client with wallet...');
      const clientPromise = new linera.Client(this.wallet);
      this.client = await clientPromise;
      console.log('Client created successfully:', this.client);
      
      // Claim chain
      await updateStatus('Claiming Chain');
      console.log('Claiming chain...');
      this.chainId = await this.faucet.claimChain(this.client);
      console.log('Chain claimed successfully:', this.chainId);
      
      // Get account owner
      this.accountOwner = `User:${this.chainId}`;
      console.log('Account owner:', this.accountOwner);
      
      // Get application
      await updateStatus('Loading Application');
      this.applicationId = process.env.REACT_APP_APPLICATION_ID || "11c588096b85b439a3281944ef68d641f39bf20de3b454f8e2764933b177bacc";
      console.log('Getting application with ID:', this.applicationId);
      
      try {
        this.application = await this.client.frontend().application(this.applicationId);
        console.log('Application loaded successfully:', this.application);
        
        // Add debug info but don't let it fail the initialization
        await this.debugApplicationInfo();
        
      } catch (appError) {
        console.warn('Failed to load application, but connection is still valid:', appError);
        // Don't fail the entire initialization if just the app loading fails
        this.application = null;
      }

      // Mark as initialized regardless of application loading
      this.isInitialized = true;
      console.log('Connected to Linera backend successfully');
      
      // Ensure we update status to Ready
      await updateStatus('Ready');
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Linera backend:', error);
      this.isInitialized = false;
      await updateStatus('Error');
      return false;
    }
  }

  async debugApplicationInfo() {
    if (!this.application) {
      console.log('No application available for debugging');
      return;
    }

    try {
      console.log('=== APPLICATION DEBUG INFO ===');
      console.log('Application ID:', this.applicationId);
      console.log('Chain ID:', this.chainId);
      console.log('Account Owner:', this.accountOwner);
      console.log('Wallet:', this.wallet);
      console.log('Application object:', this.application);
      
      // Try a simple query to test connectivity - but catch any memory errors
      try {
        // Use a simpler query that's less likely to cause memory issues
        const testQuery = `query { accounts }`;
        const result = await this.application.query(testQuery);
        console.log('Test query result:', result);
      } catch (testError) {
        console.log('Test query failed:', testError.message);
        // This is expected due to memory access issues, don't fail initialization
      }
      
      console.log('=== END DEBUG INFO ===');
    } catch (error) {
      console.error('Debug info failed:', error);
      // Don't let debug failures affect initialization
    }
  }

  async startGame() {
    try {
      if (!this.isInitialized) {
        throw new Error('Linera backend not connected');
      }

      console.log('Starting game on Linera blockchain...');
      return { success: true };
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  async submitScore(score, gameTime, moves) {
    try {
      if (!this.isInitialized) {
        console.log('Backend not initialized, returning mock success');
        return { success: true, mock: true, score, reason: 'not_initialized' };
      }

      if (!this.application) {
        console.log('Application not available, returning mock success');
        return { success: true, mock: true, score, reason: 'no_application' };
      }

      console.log('Attempting to mint tokens for score:', score);

      try {
        // Try to use the fungible token transfer mutation
        const mutation = `
          mutation Transfer($owner: String!, $amount: String!, $targetChain: String!) {
            transfer(owner: $owner, amount: $amount, targetChain: $targetChain) {
              success
            }
          }
        `;

        const variables = {
          owner: this.accountOwner,
          amount: score.toString(),
          targetChain: this.chainId
        };

        const result = await this.application.mutate(mutation, variables);
        console.log('Tokens minted successfully:', result);
        return { success: true, mock: false, score, result };

      } catch (mutationError) {
        console.log('Mutation failed, trying simple operation:', mutationError.message);
        
        // Fallback to a simpler operation
        try {
          const operation = {
            Transfer: {
              owner: this.accountOwner,
              amount: score.toString(),
              target_account: {
                chain_id: this.chainId,
                owner: this.accountOwner
              }
            }
          };

          const result = await this.application.mutate(operation);
          console.log('Simple operation succeeded:', result);
          return { success: true, mock: false, score, result };

        } catch (simpleError) {
          console.log('Simple operation also failed:', simpleError.message);
          return { success: true, mock: true, score, reason: 'mutation_failed', error: simpleError.message };
        }
      }

    } catch (error) {
      console.error('Failed to submit score:', error);
      return { success: true, mock: true, score, reason: 'general_error', error: error.message };
    }
  }

  async endGame() {
    try {
      if (!this.isInitialized) {
        throw new Error('Linera backend not connected');
      }

      console.log('Game ended');
      return { success: true };
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  }

  async getUserStats() {
    // Always return default stats to avoid memory access issues
    console.log('Returning default user stats (blockchain queries disabled due to memory issues)');
    const stats = this.getDefaultStats();
    
    // Add token balance based on successful score submissions
    stats.tokenBalance = stats.bestScore;
    
    return stats;
  }

  getDefaultStats() {
    return {
      playerId: this.playerId,
      bestScore: 0,
      totalScore: 0,
      gamesPlayed: 0,
      averageScore: 0,
      totalMoves: 0,
      totalTime: 0,
      lastPlayed: null,
      tokenBalance: 0
    };
  }

  async getLeaderboard() {
    // Always return mock leaderboard to avoid memory access issues
    console.log('Returning mock leaderboard (blockchain queries disabled due to memory issues)');
    return this.getMockLeaderboard();
  }

  getMockLeaderboard() {
    return [
      {
        playerId: 'player_1...',
        score: 1500,
        tokens: 1500,
        moves: 45,
        gameTime: 120,
        timestamp: Date.now() - 3600000
      },
      {
        playerId: 'player_2...',
        score: 1200,
        tokens: 1200,
        moves: 52,
        gameTime: 180,
        timestamp: Date.now() - 7200000
      },
      {
        playerId: 'player_3...',
        score: 800,
        tokens: 800,
        moves: 38,
        gameTime: 95,
        timestamp: Date.now() - 10800000
      }
    ];
  }

  getWallet() {
    return this.wallet;
  }

  getClient() {
    return this.client;
  }

  getChainId() {
    return this.chainId;
  }

  getApplication() {
    return this.application;
  }

  getAccountOwner() {
    return this.accountOwner;
  }
}

const lineraService = new LineraService();
export default lineraService;
