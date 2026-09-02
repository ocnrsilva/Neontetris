import { TetrominoType, RotationState, Position, TetrominoDef, TETROMINO_COLORS, COLS, TOTAL_ROWS } from '../types';

// Standard 4-state Tetromino shapes: 0 (Spawn), 1 (CW 90°), 2 (180°), 3 (CCW 270°)
export const TETROMINO_DEFINITIONS: Record<TetrominoType, TetrominoDef> = {
  I: {
    type: 'I',
    color: TETROMINO_COLORS.I.color,
    glowColor: TETROMINO_COLORS.I.glowColor,
    innerColor: TETROMINO_COLORS.I.innerColor,
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
  },
  J: {
    type: 'J',
    color: TETROMINO_COLORS.J.color,
    glowColor: TETROMINO_COLORS.J.glowColor,
    innerColor: TETROMINO_COLORS.J.innerColor,
    shapes: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
  },
  L: {
    type: 'L',
    color: TETROMINO_COLORS.L.color,
    glowColor: TETROMINO_COLORS.L.glowColor,
    innerColor: TETROMINO_COLORS.L.innerColor,
    shapes: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  O: {
    type: 'O',
    color: TETROMINO_COLORS.O.color,
    glowColor: TETROMINO_COLORS.O.glowColor,
    innerColor: TETROMINO_COLORS.O.innerColor,
    shapes: [
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
    ],
  },
  S: {
    type: 'S',
    color: TETROMINO_COLORS.S.color,
    glowColor: TETROMINO_COLORS.S.glowColor,
    innerColor: TETROMINO_COLORS.S.innerColor,
    shapes: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  T: {
    type: 'T',
    color: TETROMINO_COLORS.T.color,
    glowColor: TETROMINO_COLORS.T.glowColor,
    innerColor: TETROMINO_COLORS.T.innerColor,
    shapes: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  Z: {
    type: 'Z',
    color: TETROMINO_COLORS.Z.color,
    glowColor: TETROMINO_COLORS.Z.glowColor,
    innerColor: TETROMINO_COLORS.Z.innerColor,
    shapes: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    ],
  },
};

// Standard SRS Wall Kick Table for J, L, S, T, Z pieces [dx, dy] (where +y is down in screen coordinates)
// Guideline: [dx, -dy] since in matrix coords +y is downward
const JLSTZ_KICKS: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '1->0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '1->2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '2->1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '2->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '3->2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '3->0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '0->3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],

  // 180 degree rotation kicks (SRS+)
  '0->2': [[0, 0], [0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]],
  '2->0': [[0, 0], [0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]],
  '1->3': [[0, 0], [1, 0], [1, 2], [1, 1], [0, 2], [0, 1]],
  '3->1': [[0, 0], [-1, 0], [-1, 2], [-1, 1], [0, 2], [0, 1]],
};

// Standard SRS Wall Kick Table for I piece
const I_KICKS: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],

  // 180 degree rotation kicks for I piece
  '0->2': [[0, 0], [-1, 0], [-2, 0], [1, 0], [2, 0], [0, 1]],
  '2->0': [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0], [0, -1]],
  '1->3': [[0, 0], [0, 1], [0, 2], [0, -1], [0, -2], [-1, 0]],
  '3->1': [[0, 0], [0, -1], [0, -2], [0, 1], [0, 2], [1, 0]],
};

export function getWallKicks(
  type: TetrominoType,
  fromRot: RotationState,
  toRot: RotationState
): [number, number][] {
  if (type === 'O') {
    return [[0, 0]];
  }
  const transition = `${fromRot}->${toRot}`;
  if (type === 'I') {
    return I_KICKS[transition] || [[0, 0]];
  }
  return JLSTZ_KICKS[transition] || [[0, 0]];
}

export function checkCollision(
  shape: number[][],
  pos: Position,
  matrix: (string | null)[][]
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const mx = pos.x + c;
        const my = pos.y + r;
        if (mx < 0 || mx >= COLS || my < 0 || my >= TOTAL_ROWS) {
          return true;
        }
        if (matrix[my][mx] !== null) {
          return true;
        }
      }
    }
  }
  return false;
}

// 3-Corner T-Spin Detection Algorithm (Official Tetris Guideline / TETR.IO)
export interface TSpinResult {
  isTSpin: boolean;
  isMini: boolean;
}

export function detectTSpin(
  pieceType: TetrominoType,
  pos: Position,
  rotation: RotationState,
  matrix: (string | null)[][],
  lastMovementWasRotate: boolean,
  lastKickIndex: number
): TSpinResult {
  if (pieceType !== 'T' || !lastMovementWasRotate) {
    return { isTSpin: false, isMini: false };
  }

  // Check 4 corners of the 3x3 bounding box: (x, y), (x+2, y), (x, y+2), (x+2, y+2)
  const corners = [
    { x: pos.x, y: pos.y },         // Top-left: index 0
    { x: pos.x + 2, y: pos.y },     // Top-right: index 1
    { x: pos.x + 2, y: pos.y + 2 }, // Bottom-right: index 2
    { x: pos.x, y: pos.y + 2 },     // Bottom-left: index 3
  ];

  let occupiedCount = 0;
  const isOccupied = (c: { x: number; y: number }) => {
    if (c.x < 0 || c.x >= COLS || c.y < 0 || c.y >= TOTAL_ROWS) return true;
    return matrix[c.y][c.x] !== null;
  };

  const cornerOccupancy = corners.map(isOccupied);
  occupiedCount = cornerOccupancy.filter(Boolean).length;

  if (occupiedCount < 3) {
    return { isTSpin: false, isMini: false };
  }

  // Determine "front" corners depending on rotation
  // 0 (pointing up): top corners are front (index 0, 1)
  // 1 (pointing right): right corners are front (index 1, 2)
  // 2 (pointing down): bottom corners are front (index 2, 3)
  // 3 (pointing left): left corners are front (index 3, 0)
  let frontCorners: [number, number];
  switch (rotation) {
    case 0: frontCorners = [0, 1]; break;
    case 1: frontCorners = [1, 2]; break;
    case 2: frontCorners = [2, 3]; break;
    case 3: frontCorners = [3, 0]; break;
  }

  const frontCount = (cornerOccupancy[frontCorners[0]] ? 1 : 0) + (cornerOccupancy[frontCorners[1]] ? 1 : 0);

  // If 2 front corners are occupied -> full T-Spin
  // If only 1 front corner is occupied (and 2 rear are occupied) -> T-Spin Mini, UNLESS 5th kick (index 4) was used!
  if (frontCount === 2 || lastKickIndex === 4) {
    return { isTSpin: true, isMini: false };
  } else {
    return { isTSpin: true, isMini: true };
  }
}
