import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TetrominoType,
  RotationState,
  Position,
  ActivePiece,
  GameState,
  GameMode,
  HandlingConfig,
  KeyBindings,
  ActionSplash,
  COLS,
  TOTAL_ROWS,
  VISIBLE_ROWS,
  BUFFER_ROWS,
  TETROMINO_COLORS,
} from '../types';
import { TETROMINO_DEFINITIONS, getWallKicks, checkCollision, detectTSpin } from '../utils/srs';
import { sound } from '../utils/audio';

const DEFAULT_HANDLING: HandlingConfig = {
  das: 130, // ms
  arr: 10,  // ms (fast & responsive)
  sdf: 20,  // 20x soft drop factor
  dcd: 0,
  lockDelay: 500, // 500ms
  maxLockResets: 15,
  ghostOpacity: 0.4,
  screenShake: true,
  sfxVolume: 0.8,
  bgmVolume: 0.4,
};

const DEFAULT_KEYS: KeyBindings = {
  moveLeft: ['ArrowLeft', 'KeyA'],
  moveRight: ['ArrowRight', 'KeyD'],
  softDrop: ['ArrowDown', 'KeyS'],
  hardDrop: ['Space'],
  rotateCW: ['ArrowUp', 'KeyX', 'KeyK'],
  rotateCCW: ['KeyZ', 'KeyJ'],
  rotate180: ['KeyA', 'KeyC', 'KeyL'], // secondary / alternate
  hold: ['ShiftLeft', 'ShiftRight', 'KeyC'],
  restart: ['KeyR'],
  pause: ['Escape', 'KeyP'],
};

// Shuffled 7-bag generator
function generate7Bag(): TetrominoType[] {
  const bag: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export const useGameLogic = (
  initialMode: GameMode = '40L',
  customHandling?: Partial<HandlingConfig>,
  customKeys?: Partial<KeyBindings>
) => {
  const [handling, setHandling] = useState<HandlingConfig>({ ...DEFAULT_HANDLING, ...customHandling });
  const [keyBindings, setKeyBindings] = useState<KeyBindings>({ ...DEFAULT_KEYS, ...customKeys });
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);

  // Bag and Next queue ref
  const bagQueueRef = useRef<TetrominoType[]>([...generate7Bag(), ...generate7Bag()]);

  const getNextPieceType = useCallback((): TetrominoType => {
    if (bagQueueRef.current.length < 7) {
      bagQueueRef.current.push(...generate7Bag());
    }
    return bagQueueRef.current.shift()!;
  }, []);

  // Initial State Factory
  const createInitialState = useCallback((mode: GameMode, startCountdown = false): GameState => {
    bagQueueRef.current = [...generate7Bag(), ...generate7Bag()];
    const nextQueue: TetrominoType[] = [];
    for (let i = 0; i < 5; i++) {
      nextQueue.push(bagQueueRef.current.shift()!);
    }

    return {
      matrix: Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null)),
      activePiece: null,
      ghostPosition: null,
      holdPiece: null,
      canHold: true,
      nextQueue,
      isGameOver: false,
      isWin: false,
      isPaused: false,
      isCountdown: startCountdown,
      countdownValue: startCountdown ? 3 : 0,
      mode,
      stats: {
        score: 0,
        lines: 0,
        level: 1,
        combo: -1,
        maxCombo: 0,
        b2b: -1,
        maxB2B: 0,
        piecesPlaced: 0,
        keysPressed: 0,
        finesseErrors: 0,
        attack: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        quads: 0,
        tspins: 0,
        allClears: 0,
        startTime: 0,
        endTime: null,
        elapsedMs: 0,
        pps: 0,
        apm: 0,
        kpp: 0,
      },
      actionSplashes: [],
      lockProgress: 0,
      boardShake: 0,
      lastAction: null,
      lastMovementWasRotate: false,
      lastKickIndex: 0,
    };
  }, []);

  const [state, setState] = useState<GameState>(() => createInitialState(initialMode, false));

  // Mutable Game Loop References
  const stateRef = useRef<GameState>(state);
  stateRef.current = state;

  const handlingRef = useRef<HandlingConfig>(handling);
  handlingRef.current = handling;

  const lockTimerRef = useRef<number | null>(null);
  const lockResetsRef = useRef<number>(0);
  const lowestYRef = useRef<number>(0);
  const gravityTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Input State (DAS/ARR Engine)
  const keysDownRef = useRef<Map<string, number>>(new Map()); // Key -> timestamp pressed
  const dasTriggeredRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const arrTimerRef = useRef<{ left: number; right: number; down: number }>({ left: 0, right: 0, down: 0 });

  // Calculate Ghost Position
  const calculateGhost = useCallback((shape: number[][], pos: Position, matrix: (string | null)[][]): Position => {
    let ghostY = pos.y;
    while (!checkCollision(shape, { x: pos.x, y: ghostY + 1 }, matrix)) {
      ghostY++;
    }
    return { x: pos.x, y: ghostY };
  }, []);

  // Spawn Piece Helper
  const spawnPiece = useCallback((matrix: (string | null)[][], nextQueue: TetrominoType[]): Partial<GameState> => {
    const queue = [...nextQueue];
    const type = queue.shift() || getNextPieceType();
    queue.push(getNextPieceType());

    const def = TETROMINO_DEFINITIONS[type];
    const shape = def.shapes[0];

    // Spawn row: In visible 20x10 matrix (rows 20..39), spawn at row 19 (partially above ceiling) or 18
    const spawnX = type === 'O' ? 4 : 3;
    const spawnY = BUFFER_ROWS - (type === 'I' ? 2 : 1);
    const spawnPos: Position = { x: spawnX, y: spawnY };

    if (checkCollision(shape, spawnPos, matrix)) {
      // Block out (Game Over)
      sound.playGameOver();
      return {
        isGameOver: true,
        activePiece: null,
        ghostPosition: null,
        nextQueue: queue,
      };
    }

    const ghost = calculateGhost(shape, spawnPos, matrix);
    lockTimerRef.current = null;
    lockResetsRef.current = 0;
    lowestYRef.current = spawnY;

    const newActive: ActivePiece = {
      type,
      shape,
      rotation: 0,
      position: spawnPos,
      color: def.color,
      glowColor: def.glowColor,
      innerColor: def.innerColor,
      lowestY: spawnY,
    };

    return {
      activePiece: newActive,
      ghostPosition: ghost,
      nextQueue: queue,
      canHold: true,
      lastMovementWasRotate: false,
      lastKickIndex: 0,
      lockProgress: 0,
    };
  }, [calculateGhost, getNextPieceType]);

  // Check Grounded
  const isGrounded = useCallback((piece: ActivePiece, matrix: (string | null)[][]): boolean => {
    return checkCollision(piece.shape, { x: piece.position.x, y: piece.position.y + 1 }, matrix);
  }, []);

  // Lock Piece Function
  const lockPiece = useCallback(() => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

    sound.playLock();

    // 1. Stamp piece onto matrix
    const newMatrix = s.matrix.map(row => [...row]);
    piece.shape.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          const my = piece.position.y + r;
          const mx = piece.position.x + c;
          if (my >= 0 && my < TOTAL_ROWS && mx >= 0 && mx < COLS) {
            newMatrix[my][mx] = piece.color;
          }
        }
      });
    });

    // 2. Detect T-Spin
    const tspin = detectTSpin(
      piece.type,
      piece.position,
      piece.rotation,
      s.matrix,
      s.lastMovementWasRotate,
      s.lastKickIndex
    );

    // 3. Clear lines
    const remainingRows: (string | null)[][] = [];
    let linesCleared = 0;

    for (let r = 0; r < TOTAL_ROWS; r++) {
      if (newMatrix[r].every(cell => cell !== null)) {
        linesCleared++;
      } else {
        remainingRows.push(newMatrix[r]);
      }
    }

    const emptyRowsCount = linesCleared;
    const newEmptyRows = Array.from({ length: emptyRowsCount }, () => Array(COLS).fill(null));
    const finalizedMatrix = [...newEmptyRows, ...remainingRows];

    // 4. Perfect Clear check
    const isPerfectClear = linesCleared > 0 && finalizedMatrix.every(row => row.every(cell => cell === null));

    // 5. Back-to-Back & Scoring calculation
    let isDifficult = false;
    let splashTitle = '';
    let splashColor = piece.color;
    let baseScore = 0;
    let attack = 0;

    if (tspin.isTSpin) {
      isDifficult = true;
      if (tspin.isMini) {
        if (linesCleared === 0) {
          splashTitle = 'T-SPIN MINI';
          baseScore = 100;
        } else if (linesCleared === 1) {
          splashTitle = 'T-SPIN MINI SINGLE';
          baseScore = 200;
          attack = 1;
        } else if (linesCleared === 2) {
          splashTitle = 'T-SPIN MINI DOUBLE';
          baseScore = 400;
          attack = 2;
        }
      } else {
        if (linesCleared === 0) {
          splashTitle = 'T-SPIN';
          baseScore = 400;
        } else if (linesCleared === 1) {
          splashTitle = 'T-SPIN SINGLE';
          baseScore = 800;
          attack = 2;
        } else if (linesCleared === 2) {
          splashTitle = 'T-SPIN DOUBLE';
          baseScore = 1200;
          attack = 4;
        } else if (linesCleared === 3) {
          splashTitle = 'T-SPIN TRIPLE';
          baseScore = 1600;
          attack = 6;
        }
      }
    } else if (linesCleared === 4) {
      isDifficult = true;
      splashTitle = 'TETRIS';
      splashColor = '#00e5ff';
      baseScore = 800;
      attack = 4;
    } else if (linesCleared === 3) {
      splashTitle = 'TRIPLE';
      baseScore = 500;
      attack = 2;
    } else if (linesCleared === 2) {
      splashTitle = 'DOUBLE';
      baseScore = 300;
      attack = 1;
    } else if (linesCleared === 1) {
      splashTitle = 'SINGLE';
      baseScore = 100;
      attack = 0;
    }

    // Combo handling
    let newCombo = s.stats.combo;
    if (linesCleared > 0) {
      newCombo++;
    } else {
      newCombo = -1;
    }

    // Back to Back handling
    let newB2B = s.stats.b2b;
    let b2bMultiplier = 1;
    if (isDifficult) {
      newB2B++;
      if (newB2B > 0) {
        b2bMultiplier = 1.5;
      }
    } else if (linesCleared > 0) {
      newB2B = -1;
    }

    // Combo Attack bonus table (TETR.IO standard)
    const comboAttacks = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5];
    if (newCombo > 0) {
      attack += comboAttacks[Math.min(newCombo, comboAttacks.length - 1)];
    }

    // Score calculations
    const level = Math.floor((s.stats.lines + linesCleared) / 10) + 1;
    let totalScoreGain = baseScore * level * b2bMultiplier;
    if (newCombo > 0) {
      totalScoreGain += 50 * newCombo * level;
    }
    if (isPerfectClear) {
      totalScoreGain += 3500 * level;
      attack += 10;
      splashTitle = 'PERFECT CLEAR';
      splashColor = '#eab308';
      sound.playPerfectClear();
    } else if (linesCleared > 0) {
      sound.playClear(linesCleared, tspin.isTSpin, newB2B > 0, Math.max(0, newCombo));
    }

    // Action Splash
    let newSplashes = [...s.actionSplashes];
    if (splashTitle) {
      const splash: ActionSplash = {
        id: Date.now() + Math.random(),
        type: isPerfectClear ? 'PERFECT_CLEAR' : (splashTitle as any),
        title: splashTitle,
        subtitle: newB2B > 0 && isDifficult ? `B2B x${newB2B + 1}` : (newCombo > 0 ? `${newCombo} COMBO` : undefined),
        scoreGained: totalScoreGain,
        combo: newCombo,
        b2b: newB2B,
        color: splashColor,
        timestamp: Date.now(),
      };
      newSplashes = [splash, ...newSplashes.slice(0, 3)];
    }

    // Update Stats
    const newLines = s.stats.lines + linesCleared;
    const newPiecesPlaced = s.stats.piecesPlaced + 1;
    const now = Date.now();
    const elapsed = Math.max(1, now - (s.stats.startTime || now));
    const pps = Number(((newPiecesPlaced / (elapsed / 1000))).toFixed(2));
    const apm = Number((((s.stats.attack + attack) / (elapsed / 60000))).toFixed(1));
    const kpp = Number(((s.stats.keysPressed / newPiecesPlaced)).toFixed(2));

    // Win condition for 40 Lines (Sprint)
    let isWin = false;
    let isGameOver = false;
    if (s.mode === '40L' && newLines >= 40) {
      isWin = true;
      sound.playWin();
    }

    // Screen Shake trigger for heavy actions
    const shakeIntensity = linesCleared === 4 || tspin.isTSpin || isPerfectClear ? 8 : (linesCleared > 0 ? 3 : 0);

    const spawnResult = !isWin ? spawnPiece(finalizedMatrix, s.nextQueue) : {};

    setState(prev => ({
      ...prev,
      matrix: finalizedMatrix,
      boardShake: shakeIntensity,
      isWin,
      isGameOver: isGameOver || !!spawnResult.isGameOver,
      actionSplashes: newSplashes,
      stats: {
        ...prev.stats,
        score: prev.stats.score + totalScoreGain,
        lines: newLines,
        level,
        combo: newCombo,
        maxCombo: Math.max(prev.stats.maxCombo, newCombo),
        b2b: newB2B,
        maxB2B: Math.max(prev.stats.maxB2B, newB2B),
        piecesPlaced: newPiecesPlaced,
        attack: prev.stats.attack + attack,
        singles: prev.stats.singles + (linesCleared === 1 && !tspin.isTSpin ? 1 : 0),
        doubles: prev.stats.doubles + (linesCleared === 2 && !tspin.isTSpin ? 1 : 0),
        triples: prev.stats.triples + (linesCleared === 3 && !tspin.isTSpin ? 1 : 0),
        quads: prev.stats.quads + (linesCleared === 4 ? 1 : 0),
        tspins: prev.stats.tspins + (tspin.isTSpin ? 1 : 0),
        allClears: prev.stats.allClears + (isPerfectClear ? 1 : 0),
        endTime: isWin ? now : null,
        elapsedMs: elapsed,
        pps,
        apm,
        kpp,
      },
      ...spawnResult,
    }));
  }, [calculateGhost, spawnPiece]);

  // Movement Functions
  const moveHorizontal = useCallback((dir: -1 | 1) => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return false;

    const newPos: Position = { x: piece.position.x + dir, y: piece.position.y };
    if (!checkCollision(piece.shape, newPos, s.matrix)) {
      const ghost = calculateGhost(piece.shape, newPos, s.matrix);
      sound.playMove();

      // Reset lock delay if grounded
      if (isGrounded(piece, s.matrix) && lockResetsRef.current < handlingRef.current.maxLockResets) {
        lockTimerRef.current = performance.now();
        lockResetsRef.current++;
      }

      setState(prev => {
        if (!prev.activePiece) return prev;
        return {
          ...prev,
          activePiece: { ...prev.activePiece, position: newPos },
          ghostPosition: ghost,
          lastMovementWasRotate: false,
          stats: { ...prev.stats, keysPressed: prev.stats.keysPressed + 1 },
        };
      });
      return true;
    }
    return false;
  }, [calculateGhost, isGrounded]);

  const rotatePiece = useCallback((rotationDirection: 1 | -1 | 2) => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

    const currentRot = piece.rotation;
    let nextRot: RotationState;
    if (rotationDirection === 1) {
      nextRot = ((currentRot + 1) % 4) as RotationState;
    } else if (rotationDirection === -1) {
      nextRot = ((currentRot + 3) % 4) as RotationState;
    } else {
      nextRot = ((currentRot + 2) % 4) as RotationState;
    }

    const def = TETROMINO_DEFINITIONS[piece.type];
    const newShape = def.shapes[nextRot];
    const kicks = getWallKicks(piece.type, currentRot, nextRot);

    for (let i = 0; i < kicks.length; i++) {
      const [kx, ky] = kicks[i];
      const testPos: Position = {
        x: piece.position.x + kx,
        y: piece.position.y + ky,
      };

      if (!checkCollision(newShape, testPos, s.matrix)) {
        sound.playRotate();
        const ghost = calculateGhost(newShape, testPos, s.matrix);

        // Reset lock timer if grounded
        if (isGrounded({ ...piece, shape: newShape, position: testPos }, s.matrix) &&
            lockResetsRef.current < handlingRef.current.maxLockResets) {
          lockTimerRef.current = performance.now();
          lockResetsRef.current++;
        }

        setState(prev => {
          if (!prev.activePiece) return prev;
          return {
            ...prev,
            activePiece: {
              ...prev.activePiece,
              shape: newShape,
              rotation: nextRot,
              position: testPos,
            },
            ghostPosition: ghost,
            lastMovementWasRotate: true,
            lastKickIndex: i,
            stats: { ...prev.stats, keysPressed: prev.stats.keysPressed + 1 },
          };
        });
        return;
      }
    }
  }, [calculateGhost, isGrounded]);

  const softDrop = useCallback(() => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

    const newPos: Position = { x: piece.position.x, y: piece.position.y + 1 };
    if (!checkCollision(piece.shape, newPos, s.matrix)) {
      sound.playSoftDrop();

      // If falling below lowest Y, reset lock reset counter
      if (newPos.y > lowestYRef.current) {
        lowestYRef.current = newPos.y;
        lockResetsRef.current = 0;
        lockTimerRef.current = null;
      }

      setState(prev => {
        if (!prev.activePiece) return prev;
        return {
          ...prev,
          activePiece: { ...prev.activePiece, position: newPos },
          stats: {
            ...prev.stats,
            score: prev.stats.score + 1,
            keysPressed: prev.stats.keysPressed + 1,
          },
          lastMovementWasRotate: false,
        };
      });
    } else {
      // Grounded -> lock immediate or start lock timer
      if (!lockTimerRef.current) {
        lockTimerRef.current = performance.now();
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

    const ghost = calculateGhost(piece.shape, piece.position, s.matrix);
    const dropDistance = ghost.y - piece.position.y;
    sound.playHardDrop();

    // Instant teleport and lock
    setState(prev => {
      if (!prev.activePiece) return prev;
      return {
        ...prev,
        activePiece: { ...prev.activePiece, position: ghost },
        stats: {
          ...prev.stats,
          score: prev.stats.score + dropDistance * 2,
          keysPressed: prev.stats.keysPressed + 1,
        },
      };
    });

    // Schedule lock on this tick
    setTimeout(() => {
      lockPiece();
    }, 0);
  }, [calculateGhost, lockPiece]);

  const holdPiece = useCallback(() => {
    const s = stateRef.current;
    const piece = s.activePiece;
    if (!piece || !s.canHold || s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

    sound.playHold();
    const currentType = piece.type;
    const prevHold = s.holdPiece;

    if (!prevHold) {
      const spawnRes = spawnPiece(s.matrix, s.nextQueue);
      setState(prev => ({
        ...prev,
        holdPiece: currentType,
        canHold: false,
        stats: { ...prev.stats, keysPressed: prev.stats.keysPressed + 1 },
        ...spawnRes,
      }));
    } else {
      const def = TETROMINO_DEFINITIONS[prevHold];
      const spawnX = prevHold === 'O' ? 4 : 3;
      const spawnY = BUFFER_ROWS - (prevHold === 'I' ? 2 : 1);
      const spawnPos = { x: spawnX, y: spawnY };
      const ghost = calculateGhost(def.shapes[0], spawnPos, s.matrix);

      lockTimerRef.current = null;
      lockResetsRef.current = 0;
      lowestYRef.current = spawnY;

      const newActive: ActivePiece = {
        type: prevHold,
        shape: def.shapes[0],
        rotation: 0,
        position: spawnPos,
        color: def.color,
        glowColor: def.glowColor,
        innerColor: def.innerColor,
        lowestY: spawnY,
      };

      setState(prev => ({
        ...prev,
        holdPiece: currentType,
        activePiece: newActive,
        ghostPosition: ghost,
        canHold: false,
        lastMovementWasRotate: false,
        lastKickIndex: 0,
        lockProgress: 0,
        stats: { ...prev.stats, keysPressed: prev.stats.keysPressed + 1 },
      }));
    }
  }, [calculateGhost, spawnPiece]);

  const resetGame = useCallback((newMode?: GameMode) => {
    const modeToUse = newMode || gameMode;
    setGameMode(modeToUse);
    const initial = createInitialState(modeToUse, true);
    setState(initial);
    stateRef.current = initial;
    lockTimerRef.current = null;
    lockResetsRef.current = 0;
    lowestYRef.current = 0;
    gravityTimerRef.current = 0;
    lastTimeRef.current = performance.now();
    dasTriggeredRef.current = { left: false, right: false };
    keysDownRef.current.clear();
  }, [createInitialState, gameMode]);

  const togglePause = useCallback(() => {
    setState(prev => {
      if (prev.isGameOver || prev.isWin || prev.isCountdown) return prev;
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, []);

  // Keyboard Event Handlers (High performance DAS / ARR)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture inputs if in input / textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const code = e.code;
      const keys = keyBindings;

      if (keys.restart.includes(code)) {
        e.preventDefault();
        resetGame();
        return;
      }

      if (keys.pause.includes(code)) {
        e.preventDefault();
        togglePause();
        return;
      }

      const s = stateRef.current;
      if (s.isGameOver || s.isWin || s.isPaused || s.isCountdown) return;

      // Rotate inputs (instant trigger)
      if (keys.rotateCW.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) rotatePiece(1);
        keysDownRef.current.set(code, performance.now());
        return;
      }
      if (keys.rotateCCW.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) rotatePiece(-1);
        keysDownRef.current.set(code, performance.now());
        return;
      }
      if (keys.rotate180.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) rotatePiece(2);
        keysDownRef.current.set(code, performance.now());
        return;
      }

      // Hard Drop (instant trigger)
      if (keys.hardDrop.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) hardDrop();
        keysDownRef.current.set(code, performance.now());
        return;
      }

      // Hold (instant trigger)
      if (keys.hold.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) holdPiece();
        keysDownRef.current.set(code, performance.now());
        return;
      }

      // Left Move
      if (keys.moveLeft.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) {
          moveHorizontal(-1);
          dasTriggeredRef.current.left = false;
        }
        keysDownRef.current.set(code, performance.now());
        return;
      }

      // Right Move
      if (keys.moveRight.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) {
          moveHorizontal(1);
          dasTriggeredRef.current.right = false;
        }
        keysDownRef.current.set(code, performance.now());
        return;
      }

      // Soft Drop
      if (keys.softDrop.includes(code)) {
        e.preventDefault();
        if (!keysDownRef.current.has(code)) {
          softDrop();
        }
        keysDownRef.current.set(code, performance.now());
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyBindings, hardDrop, holdPiece, moveHorizontal, resetGame, rotatePiece, softDrop, togglePause]);

  // Main 60/120 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const s = stateRef.current;

      // Handle Countdown (3, 2, 1, GO!)
      if (s.isCountdown) {
        if (!gravityTimerRef.current) gravityTimerRef.current = time;
        if (time - gravityTimerRef.current > 700) {
          gravityTimerRef.current = time;
          const nextCount = s.countdownValue - 1;
          sound.playCountdown(nextCount);

          if (nextCount < 0) {
            // Start game
            const spawnRes = spawnPiece(s.matrix, s.nextQueue);
            setState(prev => ({
              ...prev,
              isCountdown: false,
              countdownValue: 0,
              stats: { ...prev.stats, startTime: Date.now() },
              ...spawnRes,
            }));
            sound.startBGM();
          } else {
            setState(prev => ({ ...prev, countdownValue: nextCount }));
          }
        }
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      if (s.isGameOver || s.isWin || s.isPaused) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const h = handlingRef.current;
      const keys = keyBindings;

      // 1. Process DAS & ARR for Left/Right
      let isLeftHeld = false;
      let leftPressTime = 0;
      for (const k of keys.moveLeft) {
        if (keysDownRef.current.has(k)) {
          isLeftHeld = true;
          leftPressTime = keysDownRef.current.get(k)!;
          break;
        }
      }

      let isRightHeld = false;
      let rightPressTime = 0;
      for (const k of keys.moveRight) {
        if (keysDownRef.current.has(k)) {
          isRightHeld = true;
          rightPressTime = keysDownRef.current.get(k)!;
          break;
        }
      }

      // Prioritize the most recently pressed direction if both held
      if (isLeftHeld && (!isRightHeld || leftPressTime > rightPressTime)) {
        const holdDuration = time - leftPressTime;
        if (holdDuration >= h.das) {
          if (h.arr === 0) {
            // Instant ARR (pro setting) -> teleport all the way left
            while (moveHorizontal(-1));
          } else {
            arrTimerRef.current.left += dt;
            while (arrTimerRef.current.left >= h.arr) {
              moveHorizontal(-1);
              arrTimerRef.current.left -= h.arr;
            }
          }
        }
      } else {
        arrTimerRef.current.left = 0;
      }

      if (isRightHeld && (!isLeftHeld || rightPressTime > leftPressTime)) {
        const holdDuration = time - rightPressTime;
        if (holdDuration >= h.das) {
          if (h.arr === 0) {
            // Instant ARR
            while (moveHorizontal(1));
          } else {
            arrTimerRef.current.right += dt;
            while (arrTimerRef.current.right >= h.arr) {
              moveHorizontal(1);
              arrTimerRef.current.right -= h.arr;
            }
          }
        }
      } else {
        arrTimerRef.current.right = 0;
      }

      // 2. Process Soft Drop
      let isDownHeld = false;
      for (const k of keys.softDrop) {
        if (keysDownRef.current.has(k)) {
          isDownHeld = true;
          break;
        }
      }

      // 3. Gravity Calculation
      const baseGravityMs = Math.max(80, 800 - (s.stats.level - 1) * 60);
      const gravityInterval = isDownHeld ? Math.max(10, baseGravityMs / (h.sdf || 20)) : baseGravityMs;

      gravityTimerRef.current += dt;
      if (gravityTimerRef.current >= gravityInterval) {
        gravityTimerRef.current = 0;
        if (s.activePiece) {
          if (checkCollision(s.activePiece.shape, { x: s.activePiece.position.x, y: s.activePiece.position.y + 1 }, s.matrix)) {
            // Grounded
            if (!lockTimerRef.current) {
              lockTimerRef.current = time;
            }
          } else {
            // Fall 1 row
            const nextY = s.activePiece.position.y + 1;
            if (nextY > lowestYRef.current) {
              lowestYRef.current = nextY;
              lockResetsRef.current = 0;
              lockTimerRef.current = null;
            }
            setState(prev => {
              if (!prev.activePiece) return prev;
              return {
                ...prev,
                activePiece: {
                  ...prev.activePiece,
                  position: { ...prev.activePiece.position, y: nextY },
                },
                lastMovementWasRotate: false,
              };
            });
          }
        }
      }

      // 4. Lock Delay Progress & Trigger
      if (s.activePiece && isGrounded(s.activePiece, s.matrix)) {
        if (!lockTimerRef.current) {
          lockTimerRef.current = time;
        }
        const elapsedLock = time - lockTimerRef.current;
        const progress = Math.min(1, elapsedLock / h.lockDelay);

        if (elapsedLock >= h.lockDelay) {
          lockPiece();
        } else {
          setState(prev => ({ ...prev, lockProgress: progress }));
        }
      } else {
        lockTimerRef.current = null;
        if (s.lockProgress > 0) {
          setState(prev => ({ ...prev, lockProgress: 0 }));
        }
      }

      // 5. Blitz Timer countdown (120s limit)
      if (s.mode === 'BLITZ') {
        const elapsed = time - (s.stats.startTime || time);
        if (elapsed >= 120000) {
          sound.playGameOver();
          setState(prev => ({
            ...prev,
            isGameOver: true,
            stats: { ...prev.stats, endTime: Date.now(), elapsedMs: 120000 },
          }));
        }
      }

      // 6. Shake decay
      if (s.boardShake > 0) {
        setState(prev => ({ ...prev, boardShake: Math.max(0, prev.boardShake - 0.5) }));
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isGrounded, lockPiece, moveHorizontal, softDrop, spawnPiece, keyBindings]);

  return {
    state,
    handling,
    setHandling,
    keyBindings,
    setKeyBindings,
    gameMode,
    moveLeft: () => moveHorizontal(-1),
    moveRight: () => moveHorizontal(1),
    softDrop,
    hardDrop,
    rotateCW: () => rotatePiece(1),
    rotateCCW: () => rotatePiece(-1),
    rotate180: () => rotatePiece(2),
    hold: holdPiece,
    resetGame,
    togglePause,
  };
};
