import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINO_DEFINITIONS } from '../utils/srs';

interface HoldDisplayProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  audioData: number[];
}

export const HoldDisplay: React.FC<HoldDisplayProps> = ({ holdPiece, canHold, audioData }) => {
  const intensity = audioData.slice(0, 4).reduce((a, b) => a + b, 0) / (4 * 255 || 1);
  const def = holdPiece ? TETROMINO_DEFINITIONS[holdPiece] : null;
  const shape = def ? def.shapes[0] : null;

  return (
    <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md w-28 lg:w-32 transition-all">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-orbitron font-bold tracking-widest text-white/50 uppercase">
          HOLD
        </span>
        <span
          className={`w-2 h-2 rounded-full ${
            canHold ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500/40'
          }`}
        />
      </div>

      <div
        className={`w-full aspect-square flex items-center justify-center rounded-lg bg-[#080a14]/60 border border-white/5 transition-all duration-100 ${
          !canHold ? 'opacity-40 grayscale' : 'opacity-100'
        }`}
        style={{ transform: `scale(${1 + intensity * 0.05})` }}
      >
        {shape && def ? (
          <div
            className="grid gap-[2px] p-2"
            style={{
              gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))`,
            }}
          >
            {shape.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-4 h-4 lg:w-5 lg:h-5 rounded-sm transition-all"
                  style={{
                    backgroundColor: val ? def.color : 'transparent',
                    boxShadow: val ? `0 0 10px ${def.glowColor}` : 'none',
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            EMPTY
          </span>
        )}
      </div>
    </div>
  );
};
