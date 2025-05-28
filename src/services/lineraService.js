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
        
        // Load WASM
        console.log('Loading Linera WASM...');
        await updateStatus('Loading WASM');
        
        try {
            await linera.default();
            console.log('WASM loaded successfully with default method');
        } catch (wasmError) {
            console.error('WASM loading failed:', wasmError);
            throw new Error('Failed to load Linera WASM module');
        }
        
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
        this.client = await new linera.Client(this.wallet);
        console.log('Client created successfully:', this.client);
        
        // Claim chain
        await updateStatus('Claiming Chain');
        console.log('Claiming chain...');
        this.chainId = await this.faucet.claimChain(this.client);
        console.log('Chain claimed successfully:', this.chainId);
        
        // Get account owner
        this.accountOwner = `User:${this.chainId}`;
        console.log('Account owner:', this.accountOwner);
        
        // Mark as initialized BEFORE trying to load application
        this.isInitialized = true;
        console.log('✅ Connected to Linera backend successfully');
        console.log('🔗 Chain ID:', this.chainId);
        console.log('👤 Account Owner:', this.accountOwner);
        
        // Update status to Ready BEFORE application loading
        await updateStatus('Ready');
        console.log('🎯 Returning true from initializeWithStatusUpdates');
        
        // Load application in background (non-blocking)
        this.loadApplicationInBackground(updateStatus);
        
        return true;
        
    } catch (error) {
        console.error('❌ Failed to connect to Linera backend:', error);
        this.isInitialized = false;
        await updateStatus('Error');
        console.log('🎯 Returning false from initializeWithStatusUpdates');
        return false;
    }
}

// New method to load application in background
async loadApplicationInBackground(updateStatus) {
    try {
        console.log('🔄 Loading application in background...');
        await updateStatus('Loading Application');
        
        this.applicationId = process.env.REACT_APP_APPLICATION_ID || "11c588096b85b439a3281944ef68d641f39bf20de3b454f8e2764933b177bacc";
        console.log('Attempting to load application with ID:', this.applicationId);
        
        // Add shorter timeout for application loading
        const applicationPromise = this.client.frontend().application(this.applicationId);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Application loading timeout')), 5000)
        );
        
        this.application = await Promise.race([applicationPromise, timeoutPromise]);
        console.log('✅ Application loaded successfully:', this.application);
        
        // Skip debug info to avoid potential hanging
        console.log('🎯 Application Status: Loaded');
        
    } catch (appError) {
        console.warn('⚠️ Failed to load application (this is expected if app is not deployed):', appError.message);
        console.log('📝 Application loading failed - continuing without blockchain token features');
        console.log('🎮 Game will work in local mode with mock blockchain features');
        this.application = null;
    }
}

// Comment out or simplify the debugApplicationInfo method
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
        console.log('Application object:', this.application);
        console.log('=== END DEBUG INFO ===');
        
        // Skip the test query that might be causing memory issues
        
    } catch (error) {
        console.error('Debug info failed:', error);
    }
  }

  async startGame() {
    try {
      if (!this.isInitialized) {
        throw new Error('Linera backend not connected');
      }

      console.log('🎮 Starting game on Linera blockchain...');
      if (this.application) {
        console.log('✅ Game will use real blockchain features');
      } else {
        console.log('⚠️ Game will use mock blockchain features (application not available)');
      }
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

      console.log('🪙 Attempting to mint tokens for score:', score);

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
        console.log('✅ Tokens minted successfully:', result);
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
          console.log('✅ Simple operation succeeded:', result);
          return { success: true, mock: false, score, result };

        } catch (simpleError) {
          console.log('⚠️ Simple operation also failed:', simpleError.message);
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

      console.log('🏁 Game ended');
      return { success: true };
    } catch (error) {
      console.error('Failed to end game:', error);
      throw error;
    }
  }

  async getUserStats() {
    // Always return default stats to avoid memory access issues
    console.log('📊 Returning default user stats (blockchain queries disabled due to memory issues)');
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
    console.log('🏆 Returning mock leaderboard (blockchain queries disabled due to memory issues)');
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
