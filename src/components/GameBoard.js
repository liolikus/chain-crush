import React, { memo, useCallback } from 'react';

const GameBoard = memo(({
  currentColorArrangement,
  gameOver,
  gameStarted,
  animationStates,
  onDragStart,
  onDragDrop,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  // Optimize touch event handlers for mobile
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    onTouchStart(e);
  }, [onTouchStart]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    onTouchMove(e);
  }, [onTouchMove]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    onTouchEnd(e);
  }, [onTouchEnd]);

  return (
    <div 
      className={`game ${gameOver ? 'game-disabled' : ''}`}
      style={{
        touchAction: 'none', // Prevent default touch behaviors
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {currentColorArrangement.map((candyColor, index) => (
        <img
          key={index}
          src={candyColor}
          alt={`candy-${index}`}
          data-id={index}
          draggable={!gameOver && gameStarted}
          onDragStart={onDragStart}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDrop={onDragDrop}
          onDragEnd={onDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`candy-piece ${gameOver ? 'game-over' : ''} ${
            gameStarted ? 'game-active' : ''
          } ${animationStates[index] || ''}`}
          style={{
            opacity: gameOver ? 0.5 : 1,
            pointerEvents: !gameStarted || gameOver ? 'none' : 'auto',
            touchAction: 'none', // Prevent default touch behaviors
            WebkitUserSelect: 'none',
            userSelect: 'none',
            // Optimize for mobile rendering
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />
      ))}
    </div>
  );
});

export default GameBoard;
