import { useState, useCallback } from 'react';
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
  
  // Touch event state for mobile support
  const [touchStartElement, setTouchStartElement] = useState(null);
  const [touchStartPosition, setTouchStartPosition] = useState(null);
  const [lastTouchMoveTime, setLastTouchMoveTime] = useState(0);

  // Helper function to add animation class with performance optimization
  const addAnimationClass = useCallback((index, className, duration = 300) => {
    setAnimationStates((prev) => {
      // Only update if the animation is different
      if (prev[index] === className) return prev;
      return {
        ...prev,
        [index]: className,
      };
    });

    setTimeout(() => {
      setAnimationStates((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    }, duration);
  }, []);

  // Helper function to add score popup
  const addScorePopup = useCallback(
    (score, index) => {
      const row = Math.floor(index / BOARD_WIDTH);
      const col = index % BOARD_WIDTH;
      const x = col * 70 + 35; // Center of the candy
      const y = row * 70 + 35; // Center of the candy

      const popupId = Date.now() + Math.random();
      const newPopup = {
        id: popupId,
        score,
        position: { x, y },
      };

      setScorePopups((prev) => [...prev, newPopup]);

      // Play sound effect for score popup
      playSoundEffect('scorePopup');

      // Remove popup after animation
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((popup) => popup.id !== popupId));
      }, 1500);
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
    setTouchStartElement(null);
    setTouchStartPosition(null);
    setSquareBeingDragged(null);
    setSquareBeingReplaced(null);
    setLastTouchMoveTime(0);
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

  // Touch event handlers for mobile support
  const touchStart = useCallback(
    (e) => {
      e.preventDefault();
      const element = e.target;
      const touch = e.touches[0];
      setTouchStartElement(element);
      setTouchStartPosition({ x: touch.clientX, y: touch.clientY });

      // Add touch start animation
      const index = parseInt(element.getAttribute('data-id'));
      addAnimationClass(index, 'dragging', 150);
    },
    [addAnimationClass]
  );

  const touchMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!touchStartElement || !touchStartPosition) return;

      // Debounce touch move events for better performance
      const now = Date.now();
      if (now - lastTouchMoveTime < 16) return; // ~60fps
      setLastTouchMoveTime(now);

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPosition.x;
      const deltaY = touch.clientY - touchStartPosition.y;
      const threshold = 30; // Minimum distance to trigger a move

      // Find the target element based on swipe direction
      const currentIndex = parseInt(touchStartElement.getAttribute('data-id'));
      let targetIndex = null;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) {
          // Swipe right
          targetIndex = currentIndex + 1;
        } else if (deltaX < -threshold) {
          // Swipe left
          targetIndex = currentIndex - 1;
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold) {
          // Swipe down
          targetIndex = currentIndex + BOARD_WIDTH;
        } else if (deltaY < -threshold) {
          // Swipe up
          targetIndex = currentIndex - BOARD_WIDTH;
        }
      }

      // Validate target index and avoid DOM queries if possible
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < BOARD_WIDTH * BOARD_WIDTH) {
        // Check if it's a valid move (adjacent)
        const validMoves = [
          currentIndex - 1,
          currentIndex - BOARD_WIDTH,
          currentIndex + 1,
          currentIndex + BOARD_WIDTH,
        ];

        if (validMoves.includes(targetIndex)) {
          // Only query DOM if we haven't already set the target
          if (!squareBeingReplaced || parseInt(squareBeingReplaced.getAttribute('data-id')) !== targetIndex) {
            const targetElement = document.querySelector(`[data-id="${targetIndex}"]`);
            if (targetElement) {
              setSquareBeingDragged(touchStartElement);
              setSquareBeingReplaced(targetElement);

              // Add drop target animation
              addAnimationClass(targetIndex, 'drop-target', 200);
            }
          }
        }
      }
    },
    [touchStartElement, touchStartPosition, squareBeingReplaced, addAnimationClass, lastTouchMoveTime]
  );

  const touchEnd = useCallback(
    (e) => {
      e.preventDefault();

      if (squareBeingDragged && squareBeingReplaced) {
        // Use the existing dragEnd logic
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
      }

      // Reset touch state
      setTouchStartElement(null);
      setTouchStartPosition(null);
      setSquareBeingDragged(null);
      setSquareBeingReplaced(null);
    },
    [
      squareBeingDragged,
      squareBeingReplaced,
      currentColorArrangement,
      checkForColumnOfFour,
      checkForRowOfFour,
      checkForColumnOfThree,
      checkForRowOfThree,
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
