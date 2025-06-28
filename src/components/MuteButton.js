import React from 'react';

const MuteButton = ({ isMuted, isPlaying, hasInteracted, onToggleMute }) => {
  const getIcon = () => {
    if (!hasInteracted) {
      return "▶️"; // Play button to indicate music can be started
    }
    return isMuted ? "🔇" : "🎵";
  };

  const getTitle = () => {
    if (!hasInteracted) {
      return "Click to start music";
    }
    return isMuted ? "Unmute music" : "Mute music";
  };

  return (
    <div className="mute-button-container">
      <button 
        className="mute-button" 
        onClick={onToggleMute}
        title={getTitle()}
      >
        <span className="mute-icon">{getIcon()}</span>
      </button>
    </div>
  );
};

export default MuteButton; 