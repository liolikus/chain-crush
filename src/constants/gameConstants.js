import blueCandy from '../images/blue-candy.png';
import greenCandy from '../images/green-candy.png';
import orangeCandy from '../images/orange-candy.png';
import purpleCandy from '../images/purple-candy.png';
import redCandy from '../images/red-candy.png';
import yellowCandy from '../images/yellow-candy.png';
import blank from '../images/blank.png';

export const GAME_CONFIG = {
  BOARD_WIDTH: 8,
  GAME_DURATION: 60,
  POINTS_PER_THREE: 3,
  POINTS_PER_FOUR: 4,
  TOKEN_CONVERSION_RATE: 10, // 10 points = 1 token
  GAME_LOOP_INTERVAL: 100,
};

export const CANDY_COLORS = [
  blueCandy,
  orangeCandy,
  purpleCandy,
  redCandy,
  yellowCandy,
  greenCandy,
];

export const BLANK_CANDY = blank;

export const INVALID_ROW_POSITIONS = {
  FOUR: [
    5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55, 62, 63, 64,
  ],
  THREE: [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 63, 64],
};
