import React, { useEffect, useState } from 'react';
import { GameStats, GameMode } from '../types';
import { Zap, Target, Flame, Activity } from 'lucide-react';

interface StatsHUDProps {
  stats: GameStats;
  mode: GameMode;
  isPaused: boolean;
  isGameOver: boolean;
  isWin: boolean;
  isCountdown: boolean;
}

export const StatsHUD: React.FC<StatsHUDProps> = ({
  stats,
  mode,
  isPaused,
  isGameOver,
  isWin,
  isCountdown,
}) => {
  const [, setTick] = useState(0);

  // Live timer tick every 33ms for smooth millisecond updates
  useEffect(() => {
    if (isPaused || isGameOver || isWin || isCountdown || !stats.startTime) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 33);
    return () => clearInterval(interval);
  }, [isPaused, isGameOver, isWin, isCountdown, stats.startTime]);

  const getFormattedTime = () => {
    if (!stats.startTime) return '00:00.000';
    let elapsed = stats.endTime ? stats.endTime - stats.startTime : Date.now() - stats.startTime;

    if (mode === 'BLITZ') {
      elapsed = Math.max(0, 120000 - elapsed);
    }

    const mins = Math.floor(elapsed / 60000);
    const secs = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor(elapsed % 1000);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(3, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Primary Timer Block */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-white/50 text-[10px] uppercase font-orbitron tracking-widest mb-1">
          <span>{mode === 'BLITZ' ? 'TIME REMAINING' : 'TIME'}</span>
          <span className="text-cyan-400 font-mono text-[9px] font-bold">{mode}</span>
        </div>
        <div className="font-mono text-xl lg:text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          {getFormattedTime()}
        </div>
      </div>

      {/* Target / Goal Block (e.g. Lines in 40L) */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-white/50 text-[10px] uppercase font-orbitron tracking-widest mb-1">
          <span>{mode === '40L' ? 'LINES TO GO' : 'LINES CLEARED'}</span>
          <Target size={12} className="text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-orbitron text-2xl lg:text-3xl font-black text-cyan-300">
            {mode === '40L' ? Math.max(0, 40 - stats.lines) : stats.lines}
          </span>
          {mode === '40L' && <span className="text-white/40 text-xs font-mono">/ 40</span>}
        </div>
      </div>

      {/* Speed & Performance Rates: PPS & APM */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-white/50 text-[9px] uppercase font-orbitron mb-1">
            <span>PPS</span>
            <Zap size={11} className="text-amber-400" />
          </div>
          <div className="font-mono text-lg lg:text-xl font-bold text-amber-400">
            {stats.pps.toFixed(2)}
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-white/50 text-[9px] uppercase font-orbitron mb-1">
            <span>APM</span>
            <Activity size={11} className="text-fuchsia-400" />
          </div>
          <div className="font-mono text-lg lg:text-xl font-bold text-fuchsia-400">
            {stats.apm.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Score & Level */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-md">
        <div className="flex justify-between items-center text-white/50 text-[10px] uppercase font-orbitron mb-1">
          <span>SCORE</span>
          <span className="text-emerald-400 font-mono text-[9px]">LVL {stats.level}</span>
        </div>
        <div className="font-orbitron text-xl lg:text-2xl font-bold text-yellow-400 truncate">
          {stats.score.toLocaleString()}
        </div>
      </div>

      {/* Active Streaks: Combo & B2B */}
      <div className="flex flex-col gap-1.5">
        {stats.combo > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-lg animate-pulse">
            <span className="text-[10px] font-orbitron font-bold text-amber-300 flex items-center gap-1">
              <Flame size={12} className="text-amber-400" /> COMBO
            </span>
            <span className="font-orbitron font-black text-amber-300 text-sm">
              {stats.combo}x
            </span>
          </div>
        )}

        {stats.b2b > 0 && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-lg">
            <span className="text-[10px] font-orbitron font-bold text-cyan-300">
              BACK-TO-BACK
            </span>
            <span className="font-orbitron font-black text-cyan-300 text-sm">
              x{stats.b2b + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
