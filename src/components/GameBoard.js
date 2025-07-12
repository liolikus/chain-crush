import React, { memo } from 'react';

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
  return (
    <div className={`game ${gameOver ? 'game-disabled' : ''}`}>
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
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`candy-piece ${gameOver ? 'game-over' : ''} ${
            gameStarted ? 'game-active' : ''
          } ${animationStates[index] || ''}`}
          style={{
            opacity: gameOver ? 0.5 : 1,
            pointerEvents: !gameStarted || gameOver ? 'none' : 'auto',
            touchAction: 'none', // Prevent default touch behaviors
          }}
        />
      ))}
    </div>
  );
});

export default GameBoard;
