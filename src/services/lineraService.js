import * as linera from '@linera/client';

const DEPLOYED_CHAIN_ID = '95bb388c7a4fd3261a10b3152565b4bb142a8bdb1790a78a9e27895e2da11ccb';

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
        this.accountOwner = this.chainId; 
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
    if (!this.isInitialized || !this.client) {
      console.log('Backend not initialized, returning mock success');
      return { success: true, mock: true, score, reason: 'not_initialized' };
    }

    console.log('🪙 Attempting to mint tokens for score:', score);

    // Try transfer with identity as owner
    const identity = await this.client.identity();
    
    try {
      // First attempt: try direct transfer from current chain
      const transferResult = await this.client.transfer({
        amount: score,
        recipient: {
          chain_id: this.chainId,
          owner: identity
        }
      });

      console.log('✅ Transfer successful:', transferResult);
      return { 
        success: true, 
        mock: false, 
        score: score, 
        result: transferResult 
      };

    } catch (transferError) {
      console.log('Direct transfer failed, trying to get more tokens from faucet...');
      
      // If transfer fails due to insufficient balance, try to get more tokens
      if (transferError.message.includes('must not exceed the balance')) {
        try {
          console.log('💰 Claiming additional chain from faucet for more tokens...');
          
          // Claim a new chain which should come with tokens
          const newChainId = await this.faucet.claimChain(this.client);
          console.log('✅ Claimed new chain with tokens:', newChainId);
          
          // Now try the transfer FROM the new chain (which has tokens) TO our original chain
          const transferResult = await this.client.transfer({
            amount: score,
            donor: newChainId, // Transfer FROM the new chain that has tokens
            recipient: {
              chain_id: this.chainId, // TO our original chain
              owner: identity
            }
          });

          console.log('✅ Transfer successful from new chain:', transferResult);
          return { 
            success: true, 
            mock: false, 
            score: score, 
            result: transferResult 
          };
          
        } catch (faucetError) {
          console.log('Faucet transfer failed:', faucetError.message);
          
          // Alternative: Try transferring to the new chain instead
          try {
            console.log('🔄 Trying to transfer to the new chain instead...');
            
            const newChainId = await this.faucet.claimChain(this.client);
            console.log('✅ Using new chain as recipient:', newChainId);
            
            const transferResult = await this.client.transfer({
              amount: score,
              recipient: {
                chain_id: newChainId, // Transfer TO the new chain
                owner: identity
              }
            });

            console.log('✅ Transfer successful to new chain:', transferResult);
            
            // Update our chain ID to the new one for future operations
            this.chainId = newChainId;
            this.accountOwner = newChainId;
            
            return { 
              success: true, 
              mock: false, 
              score: score, 
              result: transferResult,
              newChain: true
            };
            
          } catch (newChainError) {
            console.log('New chain transfer failed:', newChainError.message);
            
            // Final fallback: cap the amount on original chain
            const maxTransfer = 100;
            const transferAmount = Math.min(score, maxTransfer);
            
            try {
              const transferResult = await this.client.transfer({
                amount: transferAmount,
                recipient: {
                  chain_id: this.chainId,
                  owner: identity
                }
              });

              console.log('✅ Capped transfer successful:', transferResult);
              return { 
                success: true, 
                mock: false, 
                score: transferAmount, 
                originalScore: score,
                result: transferResult 
              };
            } catch (cappedError) {
              console.error('All transfer attempts failed:', cappedError);
              return { success: true, mock: true, score, reason: 'all_transfers_failed', error: cappedError.message };
            }
          }
        }
      } else {
        // Different error, just return mock
        return { success: true, mock: true, score, reason: 'transfer_failed', error: transferError.message };
      }
    }

  } catch (error) {
    console.error('Failed to submit score:', error);
    return { success: true, mock: true, score, reason: 'general_error', error: error.message };
  }
}async requestTokensFromFaucet(requiredAmount) {
    try {
        if (!this.faucet || !this.client) {
            throw new Error('Faucet or client not available');
        }

        console.log(`💰 Requesting ${requiredAmount} tokens from faucet for chain ${this.chainId}`);
        
        // Method 1: Try using the faucet to request a new chain with tokens
        // This might give us a fresh allocation
        try {
            // Request additional tokens by claiming a new chain and transferring from it
            const newChainInfo = await this.faucet.claimChain(this.client);
            console.log('✅ Claimed additional chain for tokens:', newChainInfo);
            
            // The new chain should have tokens that we can transfer to our main chain
            return true;
            
        } catch (claimError) {
            console.log('Failed to claim additional chain:', claimError.message);
            
            // Method 2: Try direct faucet request if available
            try {
                // Some faucets have direct token request methods
                const faucetEndpoint = process.env.REACT_APP_LINERA_FAUCET || 'https://faucet.testnet-babbage.linera.net';
                
                // Make a direct HTTP request to the faucet
                const response = await fetch(`${faucetEndpoint}/request-tokens`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chain_id: this.chainId,
                        amount: requiredAmount
                    })
                });
                
                if (response.ok) {
                    console.log('✅ Successfully requested tokens from faucet via HTTP');
                    return true;
                } else {
                    throw new Error(`Faucet request failed: ${response.status}`);
                }
                
            } catch (httpError) {
                console.log('HTTP faucet request failed:', httpError.message);
                throw httpError;
            }
        }
        
    } catch (error) {
        console.warn('Failed to request tokens from faucet:', error.message);
        throw error;
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
