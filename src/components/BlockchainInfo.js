import React from 'react';

const BlockchainInfo = ({ isConnected, connectionTimeout, chainId, identity, applicationId }) => {
  return (
    <div className="blockchain-info">
      <p>
        {isConnected
          ? 'Your scores are converted to tokens on the Linera Microchains!'
          : connectionTimeout
          ? '💾 Connection timed out. Playing in offline mode.'
          : '💾 Playing in offline mode. Blockchain features unavailable.'}
      </p>
      {isConnected && (
        <div className="blockchain-details">
          <p>🔗 Chain ID: {chainId || 'Loading...'}</p>
          <p>📱 Wallet: {identity || 'Loading...'}</p>
          <p>🎯 Application: {applicationId || 'Loading...'}</p>
        </div>
      )}
      {(!isConnected || connectionTimeout) && (
        <div className="offline-details">
          <p>🔄 Refresh page to retry blockchain connection</p>
          <p>🎮 Game fully functional in offline mode</p>
        </div>
      )}
    </div>
  );
};

export default BlockchainInfo;
