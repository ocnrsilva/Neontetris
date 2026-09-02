export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3; // 0: spawn, 1: CW (90deg), 2: 180deg, 3: CCW (270deg)

export interface Position {
  x: number;
  y: number;
}

export interface TetrominoDef {
  type: TetrominoType;
  shapes: number[][][]; // 4 rotation shapes (0, 1, 2, 3)
  color: string;
  glowColor: string;
  innerColor: string;
}

export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  rotation: RotationState;
  position: Position;
  color: string;
  glowColor: string;
  innerColor: string;
  lowestY: number;
}

export type GameMode = '40L' | 'BLITZ' | 'MARATHON' | 'ZEN';

export interface HandlingConfig {
  das: number; // Delayed Auto Shift (ms) - e.g. 133
  arr: number; // Auto Repeat Rate (ms) - e.g. 10 (or 0 for instant)
  sdf: number; // Soft Drop Factor - e.g. 20 or 40 (or 0 for instant)
  dcd: number; // DAS Cut Delay (ms)
  lockDelay: number; // 500ms standard
  maxLockResets: number; // 15 resets standard
  ghostOpacity: number; // 0.35
  screenShake: boolean; // true
  sfxVolume: number; // 0 - 1
  bgmVolume: number; // 0 - 1
}

export interface KeyBindings {
  moveLeft: string[];
  moveRight: string[];
  softDrop: string[];
  hardDrop: string[];
  rotateCW: string[];
  rotateCCW: string[];
  rotate180: string[];
  hold: string[];
  restart: string[];
  pause: string[];
}

export type ActionClearType =
  | 'NONE'
  | 'SINGLE'
  | 'DOUBLE'
  | 'TRIPLE'
  | 'QUAD'
  | 'TSPIN_MINI_NULL'
  | 'TSPIN_MINI'
  | 'TSPIN_SINGLE'
  | 'TSPIN_DOUBLE'
  | 'TSPIN_TRIPLE'
  | 'PERFECT_CLEAR';

export interface ActionSplash {
  id: number;
  type: ActionClearType;
  title: string;
  subtitle?: string;
  scoreGained: number;
  combo: number;
  b2b: number;
  color: string;
  timestamp: number;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  b2b: number;
  maxB2B: number;
  piecesPlaced: number;
  keysPressed: number;
  finesseErrors: number;
  attack: number;
  singles: number;
  doubles: number;
  triples: number;
  quads: number;
  tspins: number;
  allClears: number;
  startTime: number;
  endTime: number | null;
  elapsedMs: number;
  pps: number; // Pieces Per Second
  apm: number; // Attacks Per Minute
  kpp: number; // Keys Per Piece
}

export interface GameState {
  matrix: (string | null)[][]; // 40 rows (20 buffer + 20 visible) x 10 cols
  activePiece: ActivePiece | null;
  ghostPosition: Position | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  isGameOver: boolean;
  isWin: boolean;
  isPaused: boolean;
  isCountdown: boolean;
  countdownValue: number;
  mode: GameMode;
  stats: GameStats;
  actionSplashes: ActionSplash[];
  lockProgress: number; // 0 to 1 for visual lock indicator
  boardShake: number; // Pixels to shake
  lastAction: ActionSplash | null;
  lastMovementWasRotate: boolean;
  lastKickIndex: number;
}

export const COLS = 10;
export const VISIBLE_ROWS = 20;
export const BUFFER_ROWS = 20;
export const TOTAL_ROWS = VISIBLE_ROWS + BUFFER_ROWS; // 40 rows

// Official TETR.IO / Guideline Colors & Glowing Hexes
export const TETROMINO_COLORS: Record<TetrominoType, { color: string; glowColor: string; innerColor: string }> = {
  I: {
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.9)',
    innerColor: '#a7f3d0'
  },
  J: {
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.9)',
    innerColor: '#93c5fd'
  },
  L: {
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.9)',
    innerColor: '#fdba74'
  },
  O: {
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.9)',
    innerColor: '#fef08a'
  },
  S: {
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.9)',
    innerColor: '#86efac'
  },
  T: {
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.9)',
    innerColor: '#d8b4fe'
  },
  Z: {
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    innerColor: '#fca5a5'
  }
};
