
import React from 'react';

interface OverlayProps {
  title: string;
  score: number;
  lines: number;
  onAction: () => void;
  actionIcon: React.ReactNode;
  actionText: string;
}

export const Overlay: React.FC<OverlayProps> = ({ title, score, lines, onAction, actionIcon, actionText }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl rounded-2xl z-30 animate-in fade-in duration-500">
      <h2 className="text-5xl font-orbitron font-black text-white mb-2 tracking-tighter text-center italic leading-tight">
        {title.split(' ').map((word, i) => (
          <span key={i} className={i === 1 ? 'text-red-500 block' : ''}>{word} </span>
        ))}
      </h2>
      
      <div className="flex flex-col items-center gap-1 mb-10">
        <p className="text-white/40 uppercase text-xs tracking-widest">Final Statistics</p>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-orbitron font-bold text-yellow-400">{score.toLocaleString()}</p>
            <p className="text-[10px] text-white/40 uppercase">Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-orbitron font-bold text-white">{lines}</p>
            <p className="text-[10px] text-white/40 uppercase">Lines</p>
          </div>
        </div>
      </div>

      <button 
        onClick={onAction}
        className="flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
      >
        {actionIcon} {actionText}
      </button>
    </div>
  );
};
