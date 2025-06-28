import React from 'react';

const MuteButton = ({ isMuted, isPlaying, onToggleMute }) => {
  return (
    <div className="mute-button-container">
      <button 
        className="mute-button" 
        onClick={onToggleMute}
        title={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <span className="mute-icon">🔇</span>
        ) : (
          <span className="mute-icon">🎵</span>
        )}
      </button>
    </div>
  );
};

export default MuteButton; 