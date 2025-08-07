import React, { memo, useCallback, useMemo } from 'react';

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
  // Detect mobile device for disabling drag events
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }, []);

  // Memoize board style for better performance
  const boardStyle = useMemo(() => ({
    touchAction: 'none', // Prevent default touch behaviors
    WebkitUserSelect: 'none',
    userSelect: 'none',
    WebkitTouchCallout: 'none', // Disable iOS callout
    WebkitTapHighlightColor: 'transparent', // Remove tap highlight
    // Hardware acceleration
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: gameStarted ? 'transform' : 'auto',
  }), [gameStarted]);

  // Optimize touch event handlers for mobile with proper event delegation
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onTouchStart(e);
  }, [onTouchStart]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onTouchMove(e);
  }, [onTouchMove]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onTouchEnd(e);
  }, [onTouchEnd]);

  // Memoize candy piece style generator for better performance
  const getCandyStyle = useCallback((index, gameOver, gameStarted, animationClass) => ({
    opacity: gameOver ? 0.5 : 1,
    pointerEvents: !gameStarted || gameOver ? 'none' : 'auto',
    touchAction: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
    // Mobile-optimized rendering
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: animationClass ? 'transform, opacity' : 'auto',
    // Improve image rendering on mobile
    imageRendering: isMobile ? 'crisp-edges' : 'auto',
  }), [isMobile]);

  // Memoize the candy pieces to prevent unnecessary re-renders
  const candyPieces = useMemo(() => {
    return currentColorArrangement.map((candyColor, index) => {
      const animationClass = animationStates[index] || '';
      const candyStyle = getCandyStyle(index, gameOver, gameStarted, animationClass);
      
      return (
        <img
          key={`candy-${index}`}
          src={candyColor}
          alt={`candy-${index}`}
          data-id={index}
          draggable={!isMobile && !gameOver && gameStarted} // Disable drag on mobile
          onDragStart={!isMobile ? onDragStart : undefined}
          onDragOver={!isMobile ? (e) => e.preventDefault() : undefined}
          onDragEnter={!isMobile ? (e) => e.preventDefault() : undefined}
          onDragLeave={!isMobile ? (e) => e.preventDefault() : undefined}
          onDrop={!isMobile ? onDragDrop : undefined}
          onDragEnd={!isMobile ? onDragEnd : undefined}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`candy-piece ${gameOver ? 'game-over' : ''} ${
            gameStarted ? 'game-active' : ''
          } ${animationClass}`}
          style={candyStyle}
          loading="eager" // Prioritize loading for game pieces
          decoding="sync" // Synchronous decoding for immediate display
        />
      );
    });
  }, [
    currentColorArrangement,
    animationStates,
    gameOver,
    gameStarted,
    isMobile,
    getCandyStyle,
    onDragStart,
    onDragDrop,
    onDragEnd,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div 
      className={`game ${gameOver ? 'game-disabled' : ''}`}
      style={boardStyle}
    >
      {candyPieces}
    </div>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
