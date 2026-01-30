
import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, TETROMINOES, TetrominoType, GameState, ActivePiece, Position, Tetromino } from '../types';

const INITIAL_SPEED = 800;
const MIN_SPEED = 100;

export const useGameLogic = () => {
  const [state, setState] = useState<GameState>(() => ({
    grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
    activePiece: null,
    ghostPosition: null,
    nextPiece: getRandomTetromino(),
    holdPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    combo: 0,
    isGameOver: false,
    isPaused: true,
    canHold: true,
  }));

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropCounterRef = useRef<number>(0);

  function getRandomTetromino(): Tetromino {
    const keys = Object.keys(TETROMINOES) as TetrominoType[];
    const key = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOES[key];
  }

  const checkCollision = useCallback((piece: ActivePiece, grid: (string | null)[][], offsetX = 0, offsetY = 0) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offsetX;
          const newY = piece.position.y + y + offsetY;
          if (
            newX < 0 || newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && grid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const calculateGhost = useCallback((piece: ActivePiece, grid: (string | null)[][]) => {
    let ghostY = piece.position.y;
    while (!checkCollision(piece, grid, 0, ghostY - piece.position.y + 1)) {
      ghostY++;
    }
    return { x: piece.position.x, y: ghostY };
  }, [checkCollision]);

  const spawnPiece = useCallback(() => {
    setState(prev => {
      const piece = prev.nextPiece;
      const newActivePiece: ActivePiece = {
        ...piece,
        position: { x: Math.floor(COLS / 2) - 1, y: 0 },
        rotation: 0
      };

      if (checkCollision(newActivePiece, prev.grid)) {
        return { ...prev, isGameOver: true };
      }

      return {
        ...prev,
        activePiece: newActivePiece,
        ghostPosition: calculateGhost(newActivePiece, prev.grid),
        nextPiece: getRandomTetromino(),
        canHold: true
      };
    });
  }, [checkCollision, calculateGhost]);

  const clearLines = useCallback((grid: (string | null)[][]) => {
    const newGrid = grid.filter(row => row.some(cell => cell === null));
    const linesCleared = ROWS - newGrid.length;
    const padding = Array.from({ length: linesCleared }, () => Array(COLS).fill(null));
    
    let scoreGain = 0;
    if (linesCleared === 1) scoreGain = 100;
    else if (linesCleared === 2) scoreGain = 300;
    else if (linesCleared === 3) scoreGain = 500;
    else if (linesCleared === 4) scoreGain = 800;

    return {
      grid: [...padding, ...newGrid],
      linesCleared,
      scoreGain: scoreGain * state.level
    };
  }, [state.level]);

  const lockPiece = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece) return prev;
      
      const newGrid = prev.grid.map(row => [...row]);
      prev.activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value && prev.activePiece) {
            const gy = prev.activePiece.position.y + y;
            const gx = prev.activePiece.position.x + x;
            if (gy >= 0) newGrid[gy][gx] = prev.activePiece.color;
          }
        });
      });

      const { grid: finalGrid, linesCleared, scoreGain } = clearLines(newGrid);
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      const newCombo = linesCleared > 0 ? prev.combo + 1 : 0;
      const comboBonus = newCombo > 1 ? (newCombo - 1) * 50 : 0;

      return {
        ...prev,
        grid: finalGrid,
        activePiece: null,
        lines: newLines,
        level: newLevel,
        score: prev.score + scoreGain + comboBonus,
        combo: newCombo,
      };
    });
    spawnPiece();
  }, [clearLines, spawnPiece]);

  const moveLeft = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || prev.isPaused) return prev;
      const newPiece = { ...prev.activePiece, position: { ...prev.activePiece.position, x: prev.activePiece.position.x - 1 } };
      if (!checkCollision(newPiece, prev.grid)) {
        return { ...prev, activePiece: newPiece, ghostPosition: calculateGhost(newPiece, prev.grid) };
      }
      return prev;
    });
  }, [checkCollision, calculateGhost]);

  const moveRight = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || prev.isPaused) return prev;
      const newPiece = { ...prev.activePiece, position: { ...prev.activePiece.position, x: prev.activePiece.position.x + 1 } };
      if (!checkCollision(newPiece, prev.grid)) {
        return { ...prev, activePiece: newPiece, ghostPosition: calculateGhost(newPiece, prev.grid) };
      }
      return prev;
    });
  }, [checkCollision, calculateGhost]);

  const moveDown = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || prev.isPaused) return prev;
      const newPiece = { ...prev.activePiece, position: { ...prev.activePiece.position, y: prev.activePiece.position.y + 1 } };
      if (!checkCollision(newPiece, prev.grid)) {
        return { ...prev, activePiece: newPiece };
      } else {
        lockPiece();
        return prev;
      }
    });
  }, [checkCollision, lockPiece]);

  const rotate = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || prev.isPaused) return prev;
      const shape = prev.activePiece.shape;
      const newShape = shape[0].map((_, i) => shape.map(row => row[i]).reverse());
      const newPiece = { ...prev.activePiece, shape: newShape };
      
      // Simple wall kick
      let offset = 0;
      if (checkCollision(newPiece, prev.grid)) {
        offset = 1;
        if (checkCollision({ ...newPiece, position: { ...newPiece.position, x: newPiece.position.x + offset } }, prev.grid)) {
          offset = -1;
          if (checkCollision({ ...newPiece, position: { ...newPiece.position, x: newPiece.position.x + offset } }, prev.grid)) {
            return prev;
          }
        }
      }
      
      const finalPiece = { ...newPiece, position: { ...newPiece.position, x: newPiece.position.x + offset } };
      return { ...prev, activePiece: finalPiece, ghostPosition: calculateGhost(finalPiece, prev.grid) };
    });
  }, [checkCollision, calculateGhost]);

  const hardDrop = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || prev.isPaused) return prev;
      const ghost = calculateGhost(prev.activePiece, prev.grid);
      const droppedPiece = { ...prev.activePiece, position: ghost };
      
      // Calculate score for hard drop (2 points per cell)
      const dropDistance = ghost.y - prev.activePiece.position.y;
      
      // We return the dropped piece and rely on lockPiece to trigger next.
      // But because lockPiece is a separate callback that works on state,
      // we need to set the state first.
      return { ...prev, activePiece: droppedPiece, score: prev.score + (dropDistance * 2) };
    });
    lockPiece();
  }, [calculateGhost, lockPiece]);

  const hold = useCallback(() => {
    setState(prev => {
      if (!prev.activePiece || !prev.canHold || prev.isPaused) return prev;
      const currentType = prev.activePiece.type;
      const heldPiece = prev.holdPiece;
      
      if (!heldPiece) {
        return {
          ...prev,
          holdPiece: TETROMINOES[currentType],
          activePiece: null, // trigger spawn
          canHold: false
        };
      } else {
        const nextActive: ActivePiece = {
          ...heldPiece,
          position: { x: Math.floor(COLS / 2) - 1, y: 0 },
          rotation: 0
        };
        return {
          ...prev,
          holdPiece: TETROMINOES[currentType],
          activePiece: nextActive,
          ghostPosition: calculateGhost(nextActive, prev.grid),
          canHold: false
        };
      }
    });
    // If we cleared the active piece, spawn a new one
    setState(prev => {
      if (!prev.activePiece && !prev.isGameOver) {
        const piece = prev.nextPiece;
        const newActive: ActivePiece = {
          ...piece,
          position: { x: Math.floor(COLS / 2) - 1, y: 0 },
          rotation: 0
        };
        return {
          ...prev,
          activePiece: newActive,
          ghostPosition: calculateGhost(newActive, prev.grid),
          nextPiece: getRandomTetromino(),
        };
      }
      return prev;
    });
  }, [calculateGhost]);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetGame = useCallback(() => {
    setState({
      grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
      activePiece: null,
      ghostPosition: null,
      nextPiece: getRandomTetromino(),
      holdPiece: null,
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      canHold: true,
    });
    spawnPiece();
  }, [spawnPiece]);

  // Initial Spawn
  useEffect(() => {
    spawnPiece();
  }, []); // Only once on mount

  // Game Loop
  const animate = useCallback((time = 0) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (!state.isPaused && !state.isGameOver) {
      dropCounterRef.current += deltaTime;
      const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (state.level - 1) * 100);
      
      if (dropCounterRef.current > speed) {
        moveDown();
        dropCounterRef.current = 0;
      }
    }

    gameLoopRef.current = requestAnimationFrame(animate);
  }, [moveDown, state.isPaused, state.isGameOver, state.level]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(animate);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [animate]);

  return {
    state,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    hold,
    resetGame,
    togglePause
  };
};
