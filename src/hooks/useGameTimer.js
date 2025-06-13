import { useState, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../constants/gameConstants';

export const useGameTimer = (gameStarted, gameOver, onGameOver) => {
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.GAME_DURATION);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(GAME_CONFIG.GAME_DURATION);
  }, []);

  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            onGameOver();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft, onGameOver]);

  return {
    timeLeft,
    formatTime,
    resetTimer,
  };
};
