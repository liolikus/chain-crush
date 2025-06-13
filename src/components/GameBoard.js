import React from 'react';

const GameBoard = ({
  currentColorArrangement,
  gameOver,
  gameStarted,
  onDragStart,
  onDragDrop,
  onDragEnd,
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
          style={{
            opacity: gameOver ? 0.5 : 1,
            pointerEvents: !gameStarted || gameOver ? 'none' : 'auto',
            transition: 'opacity 0.3s ease',
          }}
        />
      ))}
    </div>
  );
};

export default GameBoard;
