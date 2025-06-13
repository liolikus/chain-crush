import { useState, useCallback } from 'react';
import {
  GAME_CONFIG,
  CANDY_COLORS,
  BLANK_CANDY,
  INVALID_ROW_POSITIONS,
} from '../constants/gameConstants';

const { BOARD_WIDTH, POINTS_PER_THREE, POINTS_PER_FOUR } = GAME_CONFIG;

export const useGameLogic = () => {
  const [currentColorArrangement, setCurrentColorArrangement] = useState([]);
  const [squareBeingDragged, setSquareBeingDragged] = useState(null);
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [moves, setMoves] = useState(0);

  const checkForColumnOfFour = useCallback(() => {
    for (let i = 0; i <= 39; i++) {
      const columnOfFour = [i, i + BOARD_WIDTH, i + BOARD_WIDTH * 2, i + BOARD_WIDTH * 3];
      const decidedColor = currentColorArrangement[i];
      const isBlank = currentColorArrangement[i] === BLANK_CANDY;

      if (
        columnOfFour.every((square) => currentColorArrangement[square] === decidedColor && !isBlank)
      ) {
        setScoreDisplay((score) => score + POINTS_PER_FOUR);
        columnOfFour.forEach((square) => (currentColorArrangement[square] = BLANK_CANDY));
        return true;
      }
    }
    return false;
  }, [currentColorArrangement]);

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
        rowOfFour.forEach((square) => (currentColorArrangement[square] = BLANK_CANDY));
        return true;
      }
    }
    return false;
  }, [currentColorArrangement]);

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
        columnOfThree.forEach((square) => (currentColorArrangement[square] = BLANK_CANDY));
        return true;
      }
    }
    return false;
  }, [currentColorArrangement]);

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
        rowOfThree.forEach((square) => (currentColorArrangement[square] = BLANK_CANDY));
        return true;
      }
    }
    return false;
  }, [currentColorArrangement]);

  const moveIntoSquareBelow = useCallback(() => {
    for (let i = 0; i <= 55; i++) {
      const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
      const isFirstRow = firstRow.includes(i);

      if (isFirstRow && currentColorArrangement[i] === BLANK_CANDY) {
        const randomNumber = Math.floor(Math.random() * CANDY_COLORS.length);
        currentColorArrangement[i] = CANDY_COLORS[randomNumber];
      }

      if (currentColorArrangement[i + BOARD_WIDTH] === BLANK_CANDY) {
        currentColorArrangement[i + BOARD_WIDTH] = currentColorArrangement[i];
        currentColorArrangement[i] = BLANK_CANDY;
      }
    }
  }, [currentColorArrangement]);

  const createBoard = useCallback(() => {
    const randomColorArrangement = [];
    for (let i = 0; i < BOARD_WIDTH * BOARD_WIDTH; i++) {
      const randomColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
      randomColorArrangement.push(randomColor);
    }
    setCurrentColorArrangement(randomColorArrangement);
  }, []);

  const dragStart = useCallback((e) => {
    setSquareBeingDragged(e.target);
  }, []);

  const dragDrop = useCallback((e) => {
    setSquareBeingReplaced(e.target);
  }, []);

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
    createBoard();
  }, [createBoard]);

  return {
    currentColorArrangement,
    setCurrentColorArrangement,
    scoreDisplay,
    moves,
    dragStart,
    dragDrop,
    dragEnd,
    createBoard,
    resetGame,
    checkForColumnOfFour,
    checkForRowOfFour,
    checkForColumnOfThree,
    checkForRowOfThree,
    moveIntoSquareBelow,
  };
};
