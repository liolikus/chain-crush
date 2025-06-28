import { useState, useEffect, useRef } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/Jay Someday - Strawberry.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%

    // Load audio
    audioRef.current.load();

    // Don't attempt autoplay - wait for user interaction
    setIsPlaying(false);

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // Unmute
        audioRef.current.volume = 0.3;
        setIsMuted(false);
        
        // If this is the first interaction, start playing
        if (!hasInteracted) {
          setHasInteracted(true);
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((error) => {
            console.log('Play failed:', error);
            setIsPlaying(false);
          });
        }
      } else {
        // Mute
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const play = () => {
    if (audioRef.current && !isPlaying) {
      setHasInteracted(true);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Play failed:', error);
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return {
    isMuted,
    isPlaying,
    hasInteracted,
    toggleMute,
    play,
    pause
  };
}; 