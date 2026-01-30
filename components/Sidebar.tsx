
import React from 'react';
import { Tetromino } from '../types';

interface SidebarProps {
  title: string;
  piece: Tetromino | null;
  audioData: number[];
}

export const Sidebar: React.FC<SidebarProps> = ({ title, piece, audioData }) => {
  const cellSize = 25;
  const intensity = audioData.slice(0, 5).reduce((a, b) => a + b, 0) / (5 * 255);

  return (
    <div className="flex flex-col gap-2 p-4 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md">
      <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">{title}</h3>
      <div 
        className="w-full aspect-square flex items-center justify-center transition-transform duration-75"
        style={{ transform: `scale(${1 + intensity * 0.1})` }}
      >
        {piece ? (
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))` }}>
            {piece.shape.map((row, y) => (
              row.map((val, x) => (
                <div 
                  key={`${x}-${y}`} 
                  className="w-5 h-5 rounded-sm transition-all"
                  style={{ 
                    backgroundColor: val ? piece.color : 'transparent',
                    boxShadow: val ? `0 0 10px ${piece.glowColor}` : 'none'
                  }}
                />
              ))
            ))}
          </div>
        ) : (
          <div className="w-full h-full border border-dashed border-white/10 rounded-lg flex items-center justify-center">
            <span className="text-white/10 text-xs italic">NONE</span>
          </div>
        )}
      </div>
    </div>
  );
};
