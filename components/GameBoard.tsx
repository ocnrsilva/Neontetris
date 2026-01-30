
import React, { useRef, useEffect, useState } from 'react';
import { COLS, ROWS, ActivePiece, Position } from '../types';

interface GameBoardProps {
  grid: (string | null)[][];
  activePiece: ActivePiece | null;
  ghostPosition: Position | null;
  audioData: number[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ grid, activePiece, ghostPosition, audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cellSize, setCellSize] = useState(30);

  // Ajusta o tamanho do tabuleiro dinamicamente
  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      
      // No mobile, queremos que o tabuleiro ocupe bastante altura mas caiba na largura
      // No desktop, ele deve respeitar a altura da tela
      const maxH = vw < 768 ? vh * 0.55 : vh * 0.75;
      const maxW = vw * 0.85;

      const sizeByHeight = Math.floor(maxH / ROWS);
      const sizeByWidth = Math.floor(maxW / COLS);
      
      setCellSize(Math.min(sizeByHeight, sizeByWidth, 35));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const intensity = audioData.slice(0, 10).reduce((a, b) => a + b, 0) / (10 * 255 || 1);
    const pulse = intensity * 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid de Fundo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * cellSize, 0); ctx.lineTo(x * cellSize, ROWS * cellSize); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * cellSize); ctx.lineTo(COLS * cellSize, y * cellSize); ctx.stroke();
    }

    const drawBlock = (x: number, y: number, color: string, alpha: number = 1, isGhost: boolean = false) => {
      const p = 1.5;
      const r = cellSize * 0.15;
      const bx = x * cellSize + p;
      const by = y * cellSize + p;
      const bw = cellSize - p * 2;
      const bh = cellSize - p * 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (!isGhost) {
        ctx.shadowBlur = 10 + pulse;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, r);
      ctx.fill();

      // Brilho superior
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(bx + 2, by + 2, bw - 4, bh * 0.2);

      ctx.restore();
    };

    // Fantasma
    if (activePiece && ghostPosition) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) drawBlock(ghostPosition.x + x, ghostPosition.y + y, activePiece.color, 0.2, true);
        });
      });
    }

    // Blocos fixos
    grid.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) drawBlock(x, y, color);
      });
    });

    // Peça ativa
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((v, x) => {
          if (v) drawBlock(activePiece.position.x + x, activePiece.position.y + y, activePiece.color);
        });
      });
    }

  }, [grid, activePiece, ghostPosition, audioData, cellSize]);

  return (
    <canvas 
      ref={canvasRef} 
      width={cellSize * COLS} 
      height={cellSize * ROWS}
      className="rounded shadow-2xl transition-all duration-300"
    />
  );
};
