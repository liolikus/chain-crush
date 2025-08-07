import { useState, useCallback, useRef } from 'react';
import {
  GAME_CONFIG,
  CANDY_COLORS,
  BLANK_CANDY,
  INVALID_ROW_POSITIONS,
} from '../constants/gameConstants';

const { BOARD_WIDTH, POINTS_PER_THREE, POINTS_PER_FOUR } = GAME_CONFIG;

export const useGameLogic = (playSoundEffect = () => {}) => {
  const [currentColorArrangement, setCurrentColorArrangement] = useState([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState(null);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [moves, setMoves] = useState(0);
  const [animationStates, setAnimationStates] = useState({});
  const [scorePopups, setScorePopups] = useState([]);
  
  // Enhanced touch event state for mobile optimization
  const [touchStartIndex, setTouchStartIndex] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastTouchMoveTime = useRef(0);
  const touchThreshold = useRef(10); // Minimum distance for touch move
  const animationTimeouts = useRef(new Map()); // Track animation timeouts for cleanup

  // Helper function to add animation class with performance optimization and cleanup
  const addAnimationClass = useCallback((index, className, duration = 300) => {
    setAnimationStates((prev) => {
      // Only update if the animation is different
      if (prev[index] === className) return prev;
      return {
        ...prev,
        [index]: className,
      };
    });

    // Clear existing timeout for this index
    if (animationTimeouts.current.has(index)) {
      clearTimeout(animationTimeouts.current.get(index));
    }

    // Use requestAnimationFrame for better performance
    const timeoutId = setTimeout(() => {
      setAnimationStates((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      animationTimeouts.current.delete(index);
    }, duration);

    animationTimeouts.current.set(index, timeoutId);
  }, []);

  // Helper function to add score popup with mobile optimization
  const addScorePopup = useCallback(
    (score, index) => {
      const row = Math.floor(index / BOARD_WIDTH);
      const col = index % BOARD_WIDTH;
      
      // Detect mobile device more efficiently
      const isMobile = window.innerWidth <= 768;
      const candySize = isMobile ? 40 : 70;
      const x = col * candySize + candySize / 2;
      const y = row * candySize + candySize / 2;

      const popupId = Date.now() + Math.random();
      const newPopup = {
        id: popupId,
        score,
        position: { x, y },
      };

      setScorePopups((prev) => [...prev, newPopup]);

      // Play sound effect for score popup
      playSoundEffect('scorePopup');

      // Remove popup after animation with mobile-optimized timing
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((popup) => popup.id !== popupId));
      }, isMobile ? 800 : 1500);
    },
    [playSoundEffect]
  );

  const checkForColumnOfFour = useCallback(() => {
    for (let i = 0; i <= 39; i++) {
      const columnOfFour = [i, i + BOARD_WIDTH, i + BOARD_WIDTH * 2, i + BOARD_WIDTH * 3];
      const decidedColor = currentColorArrangement[i];
      const isBlank = currentColorArrangement[i] === BLANK_CANDY;

      if (
        columnOfFour.every((square) => currentColorArrangement[square] === decidedColor && !isBlank)
      ) {
        setScoreDisplay((score) => score + POINTS_PER_FOUR);

        // Add match animation to all matched pieces
        columnOfFour.forEach((square) => {
          addAnimationClass(square, 'matching');
          currentColorArrangement[square] = BLANK_CANDY;
          // Add score popup for each matched piece
          addScorePopup(POINTS_PER_FOUR, square);
        });

        return true;
      }
    }
    return false;
  }, [currentColorArrangement, addAnimationClass, addScorePopup]);

  const checkForRowOfFour = useCallback(() => {
    for (let i = 0; i < 64; i++) {
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const decidedColor = currentColorArrangement[i];
      const isBlank = currentColorArrangement[i] === BLANK_CANDY;

      if (INVALID_ROW_POSITIONS.FOUR.includes(i)) continue;

      if (
        rowOfFour.every((square) => currentColorArrangement[square] === decidedColor && !isBlank)
      ) {
        setScoreDisplay((score) => score + POINTS_PER_FOUR);

        // Add match animation to all matched pieces
        rowOfFour.forEach((square) => {
          addAnimationClass(square, 'matching');
          currentColorArrangement[square] = BLANK_CANDY;
          // Add score popup for each matched piece
          addScorePopup(POINTS_PER_FOUR, square);
        });

        return true;
      }
    }
    return false;
  }, [currentColorArrangement, addAnimationClass, addScorePopup]);

  const checkForColumnOfThree = useCallback(() => {
    for (let i = 0; i <= 47; i++) {
      const columnOfThree = [i, i + BOARD_WIDTH, i + BOARD_WIDTH * 2];
      const decidedColor = currentColorArrangement[i];
      const isBlank = currentColorArrangement[i] === BLANK_CANDY;

      if (
        columnOfThree.every(
          (square) => currentColorArrangement[square] === decidedColor && !isBlank
        )
      ) {
        setScoreDisplay((score) => score + POINTS_PER_THREE);

        // Add match animation to all matched pieces
        columnOfThree.forEach((square) => {
          addAnimationClass(square, 'matching');
          currentColorArrangement[square] = BLANK_CANDY;
          // Add score popup for each matched piece
          addScorePopup(POINTS_PER_THREE, square);
        });

        return true;
      }
    }
    return false;
  }, [currentColorArrangement, addAnimationClass, addScorePopup]);

  const checkForRowOfThree = useCallback(() => {
    for (let i = 0; i < 64; i++) {
      const rowOfThree = [i, i + 1, i + 2];
      const decidedColor = currentColorArrangement[i];
      const isBlank = currentColorArrangement[i] === BLANK_CANDY;

      if (INVALID_ROW_POSITIONS.THREE.includes(i)) continue;

      if (
        rowOfThree.every((square) => currentColorArrangement[square] === decidedColor && !isBlank)
      ) {
        setScoreDisplay((score) => score + POINTS_PER_THREE);

        // Add match animation to all matched pieces
        rowOfThree.forEach((square) => {
          addAnimationClass(square, 'matching');
          currentColorArrangement[square] = BLANK_CANDY;
          // Add score popup for each matched piece
          addScorePopup(POINTS_PER_THREE, square);
        });

        return true;
      }
    }
    return false;
  }, [currentColorArrangement, addAnimationClass, addScorePopup]);

  const moveIntoSquareBelow = useCallback(() => {
    let hasChanges = false;
    
    for (let i = 0; i <= 55; i++) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      const isFirstRow = firstRow.includes(i);

      if (isFirstRow && currentColorArrangement[i] === BLANK_CANDY) {
        const randomNumber = Math.floor(Math.random() * CANDY_COLORS.length);
        currentColorArrangement[i] = CANDY_COLORS[randomNumber];
        // Add spawn animation for new candies
        addAnimationClass(i, 'spawning');
        hasChanges = true;
      }

      if (currentColorArrangement[i + BOARD_WIDTH] === BLANK_CANDY) {
        currentColorArrangement[i + BOARD_WIDTH] = currentColorArrangement[i];
        currentColorArrangement[i] = BLANK_CANDY;
        // Add falling animation for moving candies
        addAnimationClass(i + BOARD_WIDTH, 'falling', 400);
        hasChanges = true;
      }
    }
    
    return hasChanges;
  }, [currentColorArrangement, addAnimationClass]);

  const createBoard = useCallback(() => {
    const randomColorArrangement = [];
    for (let i = 0; i < BOARD_WIDTH * BOARD_WIDTH; i++) {
      const randomColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      randomColorArrangement.push(randomColor);
    }
    setCurrentColorArrangement(randomColorArrangement);
    setAnimationStates({}); // Clear all animations
    
    // Clear touch state when board is recreated
    setTouchStartIndex(null);
    setTouchStartPosition(null);
    setIsDragging(false);
    setSquareBeingDragged(null);
    setSquareBeingReplaced(null);
  }, []);

  const dragStart = useCallback(
    (e) => {
      setSquareBeingDragged(e.target);
      // Add drag start animation
      const index = parseInt(e.target.getAttribute('data-id'));
      addAnimationClass(index, 'dragging', 150);
    },
    [addAnimationClass]
  );

  const dragDrop = useCallback(
    (e) => {
      setSquareBeingReplaced(e.target);
      // Add drop target animation
      const index = parseInt(e.target.getAttribute('data-id'));
      addAnimationClass(index, 'drop-target', 200);
    },
    [addAnimationClass]
  );

  const dragEnd = useCallback(() => {
    if (!squareBeingDragged || !squareBeingReplaced) return;

    const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute('data-id'));
    const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute('data-id'));

    currentColorArrangement[squareBeingReplacedId] = squareBeingDragged.getAttribute('src');
    currentColorArrangement[squareBeingDraggedId] = squareBeingReplaced.getAttribute('src');

    const validMoves = [
      squareBeingDraggedId - 1,
      squareBeingDraggedId - BOARD_WIDTH,
      squareBeingDraggedId + 1,
      squareBeingDraggedId + BOARD_WIDTH,
    ];

    const validMove = validMoves.includes(squareBeingReplacedId);
    const isAColumnOfFour = checkForColumnOfFour();
    const isARowOfFour = checkForRowOfFour();
    const isAColumnOfThree = checkForColumnOfThree();
    const isARowOfThree = checkForRowOfThree();

    if (
      squareBeingReplacedId &&
      validMove &&
      (isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree)
    ) {
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
      setMoves((prev) => prev + 1);
    } else {
      currentColorArrangement[squareBeingReplacedId] = squareBeingReplaced.getAttribute('src');
      currentColorArrangement[squareBeingDraggedId] = squareBeingDragged.getAttribute('src');
      setCurrentColorArrangement([...currentColorArrangement]);
    }
  }, [
    squareBeingDragged,
    squareBeingReplaced,
    currentColorArrangement,
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
  ]);

  const resetGame = useCallback(() => {
    setScoreDisplay(0);
    setMoves(0);
    setAnimationStates({});
    createBoard();
  }, [createBoard]);

  // Optimized touch start handler - no DOM queries
  const touchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const target = e.currentTarget;
    const index = parseInt(target.getAttribute('data-id'));
    
    if (index >= 0 && index < BOARD_WIDTH * BOARD_WIDTH) {
      setTouchStartIndex(index);
      setTouchStartPosition({
        x: touch.clientX,
        y: touch.clientY,
      });
      setIsDragging(false);
      
      // Add visual feedback immediately
      addAnimationClass(index, 'dragging', 150);
    }
  }, [addAnimationClass]);

  // Enhanced touch move handler with better gesture recognition for Android
  const touchMove = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Throttle touch move events for better performance
      const now = Date.now();
      if (now - lastTouchMoveTime.current < 16) return; // ~60fps
      lastTouchMoveTime.current = now;

      if (touchStartIndex === null || !touchStartPosition) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPosition.x;
      const deltaY = touch.clientY - touchStartPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Reduced threshold for better mobile sensitivity
      const threshold = 20;
      if (distance < threshold) return;
      
      if (!isDragging) {
        setIsDragging(true);
      }

      // Calculate target index based on swipe direction with improved logic
      let targetIndex = null;
      const currentRow = Math.floor(touchStartIndex / BOARD_WIDTH);
      const currentCol = touchStartIndex % BOARD_WIDTH;

      // Determine primary swipe direction (more sensitive)
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold && currentCol < BOARD_WIDTH - 1) {
          targetIndex = touchStartIndex + 1; // Swipe right
        } else if (deltaX < -threshold && currentCol > 0) {
          targetIndex = touchStartIndex - 1; // Swipe left
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold && currentRow < BOARD_WIDTH - 1) {
          targetIndex = touchStartIndex + BOARD_WIDTH; // Swipe down
        } else if (deltaY < -threshold && currentRow > 0) {
          targetIndex = touchStartIndex - BOARD_WIDTH; // Swipe up
        }
      }

      // Validate and set target
      if (targetIndex !== null && 
          targetIndex >= 0 && 
          targetIndex < BOARD_WIDTH * BOARD_WIDTH) {
        
        // Only update if target changed
        if (squareBeingReplaced !== targetIndex) {
          setSquareBeingDragged(touchStartIndex);
          setSquareBeingReplaced(targetIndex);
          
          // Add visual feedback for target
          addAnimationClass(targetIndex, 'drop-target', 200);
        }
      }
    },
    [touchStartIndex, touchStartPosition, isDragging, squareBeingReplaced, addAnimationClass]
  );

  // Enhanced touch end handler with better swap logic
  const touchEnd = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (touchStartIndex !== null && squareBeingReplaced !== null && isDragging) {
        // Perform the swap using indices instead of DOM elements
        const draggedIndex = touchStartIndex;
        const replacedIndex = squareBeingReplaced;
        
        // Validate the move is adjacent
        const validMoves = [
          draggedIndex - 1,
          draggedIndex - BOARD_WIDTH,
          draggedIndex + 1,
          draggedIndex + BOARD_WIDTH,
        ];

        // Check row boundaries to prevent wrapping
        const draggedRow = Math.floor(draggedIndex / BOARD_WIDTH);
        const replacedRow = Math.floor(replacedIndex / BOARD_WIDTH);
        const isValidRowMove = Math.abs(draggedRow - replacedRow) <= 1;

        if (validMoves.includes(replacedIndex) && isValidRowMove) {
          // Create a copy of the arrangement for the swap
          const newArrangement = [...currentColorArrangement];
          const draggedColor = newArrangement[draggedIndex];
          const replacedColor = newArrangement[replacedIndex];
          
          // Perform the swap
          newArrangement[replacedIndex] = draggedColor;
          newArrangement[draggedIndex] = replacedColor;
          
          // Temporarily update the arrangement to check for matches
          const tempArrangement = [...currentColorArrangement];
          setCurrentColorArrangement(newArrangement);
          
          // Small delay to allow state update before checking matches
          setTimeout(() => {
            const isAColumnOfFour = checkForColumnOfFour();
            const isARowOfFour = checkForRowOfFour();
            const isAColumnOfThree = checkForColumnOfThree();
            const isARowOfThree = checkForRowOfThree();

            if (isARowOfThree || isARowOfFour || isAColumnOfFour || isAColumnOfThree) {
              // Valid move with matches - keep the swap and increment moves
              setMoves((prev) => prev + 1);
              playSoundEffect('match');
            } else {
              // Invalid move - revert the swap
              setCurrentColorArrangement(tempArrangement);
              playSoundEffect('invalidMove');
            }
          }, 50);
        } else {
          // Invalid move - provide feedback
          playSoundEffect('invalidMove');
        }
      }

      // Reset all touch state
      setTouchStartIndex(null);
      setTouchStartPosition(null);
      setIsDragging(false);
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
    },
    [
      touchStartIndex,
      squareBeingReplaced,
      isDragging,
      currentColorArrangement,
      checkForColumnOfFour,
      checkForRowOfFour,
      checkForColumnOfThree,
      checkForRowOfThree,
      playSoundEffect,
      setCurrentColorArrangement,
      setMoves,
    ]
  );

  return {
    currentColorArrangement,
    setCurrentColorArrangement,
    scoreDisplay,
    moves,
    animationStates,
    scorePopups,
    dragStart,
    dragDrop,
    dragEnd,
    touchStart,
    touchMove,
    touchEnd,
    createBoard,
    resetGame,
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
  };
};
