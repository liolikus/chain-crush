import React from 'react';

const LoadingScreen = ({
  isLoading,
  connectionTimeout,
  status,
  timeoutCountdown,
  onProceedLocal,
}) => {
  if (!isLoading || connectionTimeout) return null;

  return (
    <div className="loading">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>🔗 {status}...</p>
        {status === 'Loading WASM' && <p>Loading Linera WebAssembly...</p>}
        {status === 'Creating Faucet' && <p>Connecting to faucet...</p>}
        {status === 'Creating Wallet' && <p>Creating blockchain wallet...</p>}
        {status === 'Creating Client' && <p>Setting up client...</p>}
        {status === 'Claiming Chain' && <p>Connecting to Microchain...</p>}
        {status === 'Loading Application' && <p>Loading application...</p>}
        {status === 'Loading User Data' && <p>Loading user data...</p>}
        <div className="timeout-info">
          <p>⏱️ Connection timeout in {timeoutCountdown}s</p>
          <button onClick={onProceedLocal} className="skip-btn">
            🎮 Play Locally Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
