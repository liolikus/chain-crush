import { useState, useEffect, useRef } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const soundEffectsRef = useRef({});

  useEffect(() => {
    // Create audio element for background music
    audioRef.current = new Audio('/Jay Someday - Strawberry.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Set volume to 30%

    // Load audio
    audioRef.current.load();

    // Create sound effects
    soundEffectsRef.current = {
      scorePopup: new Audio('/sharp-pop-328170.mp3'),
    };

    // Set sound effects volume
    Object.values(soundEffectsRef.current).forEach((sound) => {
      sound.volume = 0.4; // 40% volume for sound effects
    });

    // Don't attempt autoplay - wait for user interaction
    setIsPlaying(false);

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (soundEffectsRef.current) {
        Object.values(soundEffectsRef.current).forEach((sound) => {
          sound.pause();
          sound.src = '';
        });
        soundEffectsRef.current = {};
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
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
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
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
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

  const playSoundEffect = (soundName) => {
    if (isMuted) return; // Don't play sound effects if muted

    const sound = soundEffectsRef.current[soundName];
    if (sound) {
      // Reset the audio to the beginning
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.log(`Failed to play ${soundName}:`, error);
      });
    }
  };

  return {
    isMuted,
    isPlaying,
    hasInteracted,
    toggleMute,
    play,
    pause,
    playSoundEffect,
  };
};
