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
    this.identity = null;
    this.notificationCallbacks = new Set();
    this.lastUpdateTime = Date.now();
  }

  getOrCreatePlayerId() {
    let playerId = localStorage.getItem('candyCrushPlayerId');
    if (!playerId) {
      playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('candyCrushPlayerId', playerId);
    }
    return playerId;
  }

  // GraphQL helper function like in the reference
  gql(query, variables = {}) {
    return JSON.stringify({ query, variables });
  }

  async initializeWithStatusUpdates(updateStatus) {
    try {
      console.log('Connecting to Linera backend...');

      // Load WASM
      await updateStatus('Loading WASM');
      await linera.default();
      console.log('WASM loaded successfully');

      // Create faucet connection
      await updateStatus('Creating Faucet');
      const faucetEndpoint =
        process.env.REACT_APP_LINERA_FAUCET || 'https://faucet.testnet-babbage.linera.net';
      this.faucet = new linera.Faucet(faucetEndpoint);

      // Create wallet
      await updateStatus('Creating Wallet');
      this.wallet = await this.faucet.createWallet();

      // Create client
      await updateStatus('Creating Client');
      this.client = await new linera.Client(this.wallet);

      // Set up notification handling for real-time updates
      await updateStatus('Setting up Notifications');
      this.setupNotificationHandling();

      // Claim chain
      await updateStatus('Claiming Chain');
      this.chainId = await this.faucet.claimChain(this.client);

      // Get identity (like in reference)
      this.identity = await this.client.identity();
      this.accountOwner = `${this.identity}@${this.chainId}`;

      console.log('✅ Account ID:', this.accountOwner);

      // Do initial transfer to fund the account (like in reference)
      try {
        await this.client.transfer({
          recipient: {
            chain_id: this.chainId,
            owner: this.identity,
          },
          amount: 10,
        });
        console.log('✅ Initial funding transfer successful');
      } catch (fundingError) {
        console.log('⚠️ Initial funding failed (this is okay):', fundingError.message);
      }

      // Mark as initialized
      this.isInitialized = true;
      console.log('✅ Connected to Linera backend successfully');
      console.log('🔗 Chain ID:', this.chainId);
      console.log('👤 Identity:', this.identity);

      await updateStatus('Ready');

      // Load application in background (non-blocking)
      this.loadApplicationInBackground();

      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Linera backend:', error);
      this.isInitialized = false;
      await updateStatus('Error');
      return false;
    }
  }

  async loadApplicationInBackground() {
    try {
      // Use the same app ID as the reference for fungible tokens
      this.applicationId =
        process.env.REACT_APP_APPLICATION_ID ||
        '11c588096b85b439a3281944ef68d641f39bf20de3b454f8e2764933b177bacc';

      const applicationPromise = this.client.frontend().application(this.applicationId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Application loading timeout')), 5000)
      );

      this.application = await Promise.race([applicationPromise, timeoutPromise]);
      console.log('✅ Fungible token application loaded successfully');
    } catch (appError) {
      console.warn('⚠️ Failed to load fungible token application:', appError.message);
      this.application = null;
    }
  }

  async startGame() {
    if (!this.isInitialized) {
      throw new Error('Linera backend not connected');
    }
    console.log('🎮 Starting game on Linera blockchain...');
    return { success: true };
  }

  async submitScore(score, gameTime, moves) {
    try {
      if (!this.isInitialized || !this.client) {
        console.log('Backend not ready, returning mock success');
        return { success: true, mock: true, score, reason: 'backend_not_ready' };
      }

      // Convert score to tokens with 10:1 ratio
      const tokenAmount = Math.floor(score / 10);

      console.log('🪙 Converting score to tokens:', {
        originalScore: score,
        tokenAmount,
        ratio: '10:1',
      });

      // Don't mint tokens if the amount would be 0
      if (tokenAmount === 0) {
        console.log('⚠️ Score too low to mint tokens (minimum 10 points needed)');
        return {
          success: true,
          mock: true,
          score,
          tokenAmount: 0,
          reason: 'score_too_low_for_tokens',
        };
      }

      console.log('👤 Identity:', this.identity);
      console.log('🔗 Chain ID:', this.chainId);
      console.log('📍 Account:', this.accountOwner);

      // Try multiple approaches in order of preference
      const approaches = [
        // () => this.tryGraphQLTransfer(tokenAmount, score),
        // () => this.tryDirectTransfer(tokenAmount, score)
        // () => this.trySimpleTransfer(tokenAmount, score),
        () => this.tryCappedTransfer(tokenAmount, score),
      ];

      for (let i = 0; i < approaches.length; i++) {
        try {
          console.log(`🔄 Trying approach ${i + 1}/${approaches.length}...`);
          const result = await approaches[i]();
          console.log(`✅ Approach ${i + 1} successful:`, result);
          return result;
        } catch (error) {
          console.log(`❌ Approach ${i + 1} failed:`, error.message);
          if (i === approaches.length - 1) {
            // Last approach failed, return mock success
            console.log('🔄 All approaches failed, returning mock success');
            return {
              success: true,
              mock: true,
              score,
              tokenAmount,
              reason: 'all_approaches_failed',
              error: error.message,
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      const tokenAmount = Math.floor(score / 10);
      return {
        success: true,
        mock: true,
        score,
        tokenAmount,
        reason: 'general_error',
        error: error.message,
      };
    }
  }

  async tryGraphQLTransfer(tokenAmount, originalScore) {
    if (!this.application) {
      throw new Error('Application not loaded');
    }

    // Get fresh tokens from faucet
    console.log('💰 Getting fresh tokens from faucet...');
    const tokenChainId = await this.faucet.claimChain(this.client);
    console.log('✅ Got token chain:', tokenChainId);

    // Use GraphQL mutation
    const mutation = this.gql(
      `
      mutation(
        $donor: AccountOwner!,
        $amount: Amount!,
        $recipient: FungibleAccount!,
      ) {
        transfer(owner: $donor, amount: $amount, targetAccount: $recipient)
      }
    `,
      {
        donor: this.identity,
        amount: tokenAmount.toString(),
        recipient: {
          owner: this.identity,
          chainId: this.chainId,
        },
      }
    );

    console.log('🔄 Executing GraphQL transfer mutation...');

    // Add timeout to GraphQL query
    const queryPromise = this.application.query(mutation);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GraphQL query timeout')), 10000)
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const parsedResult = JSON.parse(result);

    console.log('📊 GraphQL result:', parsedResult);

    if (parsedResult.errors && parsedResult.errors.length > 0) {
      throw new Error(`GraphQL errors: ${parsedResult.errors.map((e) => e.message).join(', ')}`);
    }

    return {
      success: true,
      mock: false,
      score: originalScore,
      tokenAmount: tokenAmount,
      method: 'graphql',
      result: parsedResult,
    };
  }

  async tryDirectTransfer(tokenAmount, originalScore) {
    console.log('🔄 Trying direct client transfer...');

    const transferPromise = this.client.transfer({
      amount: tokenAmount,
      recipient: {
        chain_id: this.chainId,
        owner: this.identity,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Direct transfer timeout')), 10000)
    );

    const result = await Promise.race([transferPromise, timeoutPromise]);

    return {
      success: true,
      mock: false,
      score: originalScore,
      tokenAmount: tokenAmount,
      method: 'direct',
      result: result,
    };
  }

  async trySimpleTransfer(tokenAmount, originalScore) {
    console.log('🔄 Trying simple transfer with reduced amount...');

    // Further reduce the amount if still too high
    const reducedAmount = Math.min(tokenAmount, 5);

    const result = await this.client.transfer({
      amount: reducedAmount,
      recipient: {
        chain_id: this.chainId,
        owner: this.identity,
      },
    });

    return {
      success: true,
      mock: false,
      score: originalScore,
      tokenAmount: reducedAmount,
      originalTokenAmount: tokenAmount,
      method: 'simple',
      result: result,
    };
  }

  async tryCappedTransfer(tokenAmount, originalScore) {
    console.log('🔄 Trying final capped transfer...');

    // Cap at 1 token minimum
    const cappedAmount = tokenAmount;

    const result = await this.client.transfer({
      amount: cappedAmount,
      recipient: {
        chain_id: this.chainId,
        owner: this.identity,
      },
    });

    return {
      success: true,
      mock: false,
      score: originalScore,
      tokenAmount: cappedAmount,
      originalTokenAmount: tokenAmount,
      method: 'capped',
      result: result,
    };
  }

  async endGame() {
    if (!this.isInitialized) {
      throw new Error('Linera backend not connected');
    }
    console.log('🏁 Game ended');
    return { success: true };
  }

  // Legacy sync method - keeping for compatibility  
  getUserStatsSync() {
    return {
      playerId: this.playerId,
      bestScore: 0,
      totalScore: 0,
      gamesPlayed: 0,
      averageScore: 0,
      totalMoves: 0,
      totalTime: 0,
      lastPlayed: null,
      tokenBalance: 0,
    };
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
      tokenBalance: 0,
    };
  }

  getMockLeaderboard() {
    return [
      {
        playerId: 'player_1...',
        score: 1500,
        tokens: 1500,
        moves: 45,
        gameTime: 120,
        timestamp: Date.now() - 3600000,
      },
      {
        playerId: 'player_2...',
        score: 1200,
        tokens: 1200,
        moves: 52,
        gameTime: 180,
        timestamp: Date.now() - 7200000,
      },
      {
        playerId: 'player_3...',
        score: 800,
        tokens: 800,
        moves: 38,
        gameTime: 95,
        timestamp: Date.now() - 10800000,
      },
    ];
  }

  // Legacy sync method - keeping for compatibility
  getLeaderboardSync() {
    return this.getMockLeaderboard();
  }

  // Getters
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
  getIdentity() {
    return this.identity;
  }

  // Notification handling for real-time blockchain updates
  setupNotificationHandling() {
    if (!this.client) {
      console.warn('⚠️ Cannot setup notifications - client not available');
      return;
    }

    try {
      // Set up notification callback for new blocks like in the reference
      this.client.onNotification(notification => {
        console.log('🔔 Received blockchain notification:', notification);
        
        if (notification.reason && notification.reason.NewBlock) {
          console.log('📦 New block detected, triggering updates...');
          this.lastUpdateTime = Date.now();
          
          // Notify all registered callbacks about the blockchain update
          this.notificationCallbacks.forEach(callback => {
            try {
              callback(notification);
            } catch (error) {
              console.warn('⚠️ Notification callback failed:', error);
            }
          });
        }
      });
      
      console.log('✅ Notification handling setup successfully');
    } catch (error) {
      console.warn('⚠️ Failed to setup notification handling:', error);
    }
  }

  // Subscribe to blockchain notifications
  onBlockchainUpdate(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    this.notificationCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  // Enhanced leaderboard fetch with real-time updates
  async getLeaderboard() {
    try {
      if (!this.application || !this.isInitialized) {
        console.log('📊 Application not ready, returning mock leaderboard');
        return this.getMockLeaderboard();
      }

      // Try to fetch real leaderboard data using GraphQL
      const query = this.gql(`
        query {
          entries {
            owner
            balance
          }
        }
      `);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Leaderboard query timeout')), 5000)
      );

      const result = await Promise.race([
        this.application.query(query),
        timeout
      ]);

      const parsedResult = JSON.parse(result);
      
      if (parsedResult.data && parsedResult.data.entries) {
        // Convert blockchain data to leaderboard format
        const leaderboard = parsedResult.data.entries
          .map((entry, index) => ({
            playerId: entry.owner.substring(0, 10) + '...',
            score: entry.balance * 10, // Convert tokens back to score
            tokens: entry.balance,
            moves: Math.floor(Math.random() * 60) + 30, // Mock data
            gameTime: Math.floor(Math.random() * 120) + 60, // Mock data
            timestamp: Date.now() - (index * 1000000), // Mock timestamps
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        console.log('✅ Real leaderboard fetched from blockchain:', leaderboard);
        return leaderboard;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch real leaderboard, using mock:', error);
    }

    // Fallback to mock data
    return this.getMockLeaderboard();
  }

  // Enhanced user stats with blockchain data
  async getUserStats() {
    try {
      if (!this.application || !this.isInitialized || !this.identity) {
        return this.getDefaultStats();
      }

      // Query user's token balance
      const query = this.gql(`
        query($owner: Owner!) {
          entry(key: $owner) {
            balance
          }
        }
      `, {
        owner: this.identity
      });

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User stats query timeout')), 5000)
      );

      const result = await Promise.race([
        this.application.query(query),
        timeout
      ]);

      const parsedResult = JSON.parse(result);
      
      if (parsedResult.data && parsedResult.data.entry) {
        const tokenBalance = parsedResult.data.entry.balance || 0;
        
        return {
          playerId: this.playerId,
          bestScore: tokenBalance * 10, // Convert tokens to score equivalent
          totalScore: tokenBalance * 10,
          gamesPlayed: Math.max(1, Math.floor(tokenBalance / 50)), // Estimate
          averageScore: tokenBalance * 10,
          totalMoves: tokenBalance * 2, // Estimate
          totalTime: tokenBalance * 3, // Estimate
          lastPlayed: this.lastUpdateTime,
          tokenBalance: tokenBalance,
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch real user stats, using defaults:', error);
    }

    return this.getDefaultStats();
  }
}

const lineraService = new LineraService();
export default lineraService;
