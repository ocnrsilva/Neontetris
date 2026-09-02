import React from 'react';
import { TetrominoType } from '../types';
import { TETROMINO_DEFINITIONS } from '../utils/srs';

interface QueueDisplayProps {
  nextQueue: TetrominoType[];
  audioData: number[];
}

export const QueueDisplay: React.FC<QueueDisplayProps> = ({ nextQueue, audioData }) => {
  const intensity = audioData.slice(0, 4).reduce((a, b) => a + b, 0) / (4 * 255 || 1);

  return (
    <div className="flex flex-col items-center p-3 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md w-28 lg:w-32 transition-all">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-orbitron font-bold tracking-widest text-white/50 uppercase">
          NEXT
        </span>
        <span className="text-[10px] font-mono text-cyan-400/60 font-semibold">
          {nextQueue.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {nextQueue.slice(0, 5).map((type, idx) => {
          const def = TETROMINO_DEFINITIONS[type];
          const shape = def.shapes[0];
          const isFirst = idx === 0;

          return (
            <div
              key={`${type}-${idx}`}
              className={`w-full flex items-center justify-center rounded-lg bg-[#080a14]/60 border border-white/5 transition-all ${
                isFirst ? 'p-2.5 h-16' : 'p-1.5 h-11 opacity-75'
              }`}
              style={{
                transform: isFirst ? `scale(${1 + intensity * 0.04})` : 'none',
              }}
            >
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: `repeat(${shape[0].length}, minmax(0, 1fr))`,
                }}
              >
                {shape.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`${
                        isFirst ? 'w-3.5 h-3.5 lg:w-4 lg:h-4' : 'w-2.5 h-2.5 lg:w-3 lg:h-3'
                      } rounded-sm transition-all`}
                      style={{
                        backgroundColor: val ? def.color : 'transparent',
                        boxShadow: val ? `0 0 ${isFirst ? '8px' : '4px'} ${def.glowColor}` : 'none',
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
