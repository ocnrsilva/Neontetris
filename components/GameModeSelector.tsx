import React from 'react';
import { GameMode } from '../types';
import { Zap, Timer, Flame, Compass } from 'lucide-react';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: { id: GameMode; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: '40L',
      name: '40 LINES',
      desc: 'Sprint benchmark',
      icon: <Zap size={14} className="text-cyan-400" />,
    },
    {
      id: 'BLITZ',
      name: 'BLITZ',
      desc: '2:00 score attack',
      icon: <Timer size={14} className="text-amber-400" />,
    },
    {
      id: 'MARATHON',
      name: 'MARATHON',
      desc: '150 lines scaling',
      icon: <Flame size={14} className="text-rose-400" />,
    },
    {
      id: 'ZEN',
      name: 'ZEN',
      desc: 'Endless sandbox',
      icon: <Compass size={14} className="text-emerald-400" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md">
      {modes.map(m => (
        <button
          key={m.id}
          onClick={() => onSelectMode(m.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold tracking-wider transition-all ${
            currentMode === m.id
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
              : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
          }`}
          title={m.desc}
        >
          {m.icon}
          <span>{m.name}</span>
        </button>
      ))}
    </div>
  );
};
