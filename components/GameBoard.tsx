import React, { useRef, useEffect, useState } from 'react';
import { COLS, VISIBLE_ROWS, BUFFER_ROWS, TOTAL_ROWS, ActivePiece, Position, ActionSplash } from '../types';
import { TETROMINO_DEFINITIONS } from '../utils/srs';

interface GameBoardProps {
  matrix: (string | null)[][];
  activePiece: ActivePiece | null;
  ghostPosition: Position | null;
  audioData: number[];
  lockProgress: number;
  boardShake: number;
  actionSplashes: ActionSplash[];
  isCountdown: boolean;
  countdownValue: number;
  ghostOpacity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  matrix,
  activePiece,
  ghostPosition,
  audioData,
  lockProgress,
  boardShake,
  actionSplashes,
  isCountdown,
  countdownValue,
  ghostOpacity = 0.35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cellSize, setCellSize] = useState(32);
  const particlesRef = useRef<Particle[]>([]);
  const prevMatrixRef = useRef<(string | null)[][]>(matrix);

  // Resize canvas responsively according to viewport
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      
      const maxH = vw < 768 ? vh * 0.58 : vh * 0.78;
      const maxW = vw < 768 ? vw * 0.90 : vw * 0.45;

      const sizeByH = Math.floor(maxH / VISIBLE_ROWS);
      const sizeByW = Math.floor(maxW / COLS);
      const chosen = Math.max(18, Math.min(sizeByH, sizeByW, 36));
      setCellSize(chosen);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Detect line clears and spawn energetic neon particles
  useEffect(() => {
    // Check which rows disappeared in visible area
    for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r++) {
      const wasFilled = prevMatrixRef.current[r]?.every(c => c !== null);
      const isNowEmpty = matrix[r]?.every(c => c === null);
      if (wasFilled && isNowEmpty) {
        // Spawn row explosion particles
        const screenY = (r - BUFFER_ROWS) * cellSize + cellSize / 2;
        for (let i = 0; i < 40; i++) {
          const px = Math.random() * (COLS * cellSize);
          particlesRef.current.push({
            x: px,
            y: screenY + (Math.random() - 0.5) * cellSize,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 6 - 2,
            color: ['#00e5ff', '#a855f7', '#f97316', '#22c55e', '#eab308'][Math.floor(Math.random() * 5)],
            size: Math.random() * 3 + 2,
            alpha: 1.0,
            decay: Math.random() * 0.02 + 0.015,
          });
        }
      }
    }
    prevMatrixRef.current = matrix;
  }, [matrix, cellSize]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = COLS * cellSize;
      const height = VISIBLE_ROWS * cellSize;

      ctx.clearRect(0, 0, width, height);

      // Audio beat intensity
      const bassIntensity = audioData.slice(0, 8).reduce((a, b) => a + b, 0) / (8 * 255 || 1);
      const pulse = bassIntensity * 4;

      // Board Shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (boardShake > 0) {
        shakeX = (Math.random() - 0.5) * boardShake * 2;
        shakeY = (Math.random() - 0.5) * boardShake * 2;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Board Background & Matrix Grid
      ctx.fillStyle = '#080a14';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid lines with dynamic neon pulse
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + bassIntensity * 0.04})`;
      ctx.lineWidth = 1;

      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height);
        ctx.stroke();
      }
      for (let y = 0; y <= VISIBLE_ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width, y * cellSize);
        ctx.stroke();
      }

      // Draw Mino Helper (TETR.IO Glass Neon Block Style)
      const drawMino = (
        col: number,
        rowInVisible: number,
        color: string,
        alpha: number = 1.0,
        isGhost: boolean = false,
        isLocking: boolean = false
      ) => {
        if (rowInVisible < 0 || rowInVisible >= VISIBLE_ROWS) return;

        const pad = 1.5;
        const radius = cellSize * 0.16;
        const bx = col * cellSize + pad;
        const by = rowInVisible * cellSize + pad;
        const bw = cellSize - pad * 2;
        const bh = cellSize - pad * 2;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isGhost) {
          // Ghost piece: crisp laser stroke & subtle fill
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha * 0.2;
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, radius);
          ctx.fill();

          ctx.globalAlpha = alpha * 0.85;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          return;
        }

        // Ambient glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 + pulse + (isLocking ? 6 : 0);

        // Mino Base Fill
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, radius);
        ctx.fill();

        // Inner Bevel highlight (top-left glass sheen)
        const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(bx + 1, by + 1, bw - 2, bh - 2, radius * 0.8);
        ctx.fill();

        // Top specular reflection dot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(bx + 2, by + 2, bw * 0.4, 2);

        // Lock progress overlay (turns white/hot when close to locking)
        if (isLocking && lockProgress > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${lockProgress * 0.5})`;
          ctx.fill();
        }

        ctx.restore();
      };

      // 2. Draw Locked Matrix
      for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r++) {
        const rowInVisible = r - BUFFER_ROWS;
        for (let c = 0; c < COLS; c++) {
          const color = matrix[r][c];
          if (color) {
            drawMino(c, rowInVisible, color, 1.0, false);
          }
        }
      }

      // 3. Draw Ghost Piece
      if (activePiece && ghostPosition) {
        activePiece.shape.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val) {
              const ghostMatrixY = ghostPosition.y + r;
              const rowInVisible = ghostMatrixY - BUFFER_ROWS;
              if (rowInVisible >= 0) {
                drawMino(ghostPosition.x + c, rowInVisible, activePiece.color, ghostOpacity, true);
              }
            }
          });
        });
      }

      // 4. Draw Active Piece
      if (activePiece) {
        const isLocking = lockProgress > 0;
        activePiece.shape.forEach((row, r) => {
          row.forEach((val, c) => {
            if (val) {
              const matrixY = activePiece.position.y + r;
              const rowInVisible = matrixY - BUFFER_ROWS;
              if (rowInVisible >= 0) {
                drawMino(activePiece.position.x + c, rowInVisible, activePiece.color, 1.0, false, isLocking);
              }
            }
          });
        });
      }

      // 5. Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.vy += 0.15; // gravity

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Outer Border Glow
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);

      ctx.restore();

      // Request next frame
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [matrix, activePiece, ghostPosition, audioData, lockProgress, boardShake, cellSize, ghostOpacity]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Board Canvas with neon glow container */}
      <div className="relative rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,229,255,0.15)] border border-cyan-500/30 bg-[#080a14]">
        <canvas
          ref={canvasRef}
          width={COLS * cellSize}
          height={VISIBLE_ROWS * cellSize}
          className="block"
        />

        {/* Action Splashes (T-SPIN, TETRIS, B2B, PERFECT CLEAR) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
          {actionSplashes.map((splash) => (
            <div
              key={splash.id}
              className="absolute z-20 flex flex-col items-center animate-action-popup select-none"
              style={{
                textShadow: `0 0 20px ${splash.color}, 0 0 35px ${splash.color}`,
              }}
            >
              <span
                className="font-orbitron font-black text-2xl md:text-3xl tracking-wider text-white uppercase italic"
                style={{ color: splash.color }}
              >
                {splash.title}
              </span>
              {splash.subtitle && (
                <span className="font-orbitron font-bold text-xs md:text-sm tracking-widest text-amber-300 uppercase px-2 py-0.5 bg-black/60 rounded-full border border-amber-400/40 mt-1">
                  {splash.subtitle}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 3, 2, 1, GO! Countdown Overlay */}
        {isCountdown && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center animate-bounce">
              <span className="font-orbitron font-black text-6xl md:text-8xl tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_30px_rgba(0,229,255,0.8)]">
                {countdownValue === 0 ? 'GO!' : countdownValue}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
