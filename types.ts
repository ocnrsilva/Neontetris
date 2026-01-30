
export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
  glowColor: string;
}

export interface ActivePiece extends Tetromino {
  position: Position;
  rotation: number;
}

export interface GameState {
  grid: (string | null)[][];
  activePiece: ActivePiece | null;
  ghostPosition: Position | null;
  nextPiece: Tetromino;
  holdPiece: Tetromino | null;
  score: number;
  lines: number;
  level: number;
  combo: number;
  isGameOver: boolean;
  isPaused: boolean;
  canHold: boolean;
}

export const COLS = 10;
export const ROWS = 20;

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    color: '#00f0f0',
    glowColor: 'rgba(0, 240, 240, 0.8)'
  },
  J: {
    type: 'J',
    shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    color: '#0000f0',
    glowColor: 'rgba(0, 0, 240, 0.8)'
  },
  L: {
    type: 'L',
    shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    color: '#f0a000',
    glowColor: 'rgba(240, 160, 0, 0.8)'
  },
  O: {
    type: 'O',
    shape: [[1, 1], [1, 1]],
    color: '#f0f000',
    glowColor: 'rgba(240, 240, 0, 0.8)'
  },
  S: {
    type: 'S',
    shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    color: '#00f000',
    glowColor: 'rgba(0, 240, 0, 0.8)'
  },
  T: {
    type: 'T',
    shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    color: '#a000f0',
    glowColor: 'rgba(160, 0, 240, 0.8)'
  },
  Z: {
    type: 'Z',
    shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    color: '#f00000',
    glowColor: 'rgba(240, 0, 0, 0.8)'
  }
};
