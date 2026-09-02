import React, { useEffect } from 'react';
import { GameStats, GameMode } from '../types';
import confetti from 'canvas-confetti';
import { Play, RefreshCw, Trophy, Zap, Target, Flame, Activity } from 'lucide-react';

interface OverlayProps {
  isGameOver: boolean;
  isWin: boolean;
  isPaused: boolean;
  mode: GameMode;
  stats: GameStats;
  onRestart: () => void;
  onResume: () => void;
  onOpenSettings: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  isGameOver,
  isWin,
  isPaused,
  mode,
  stats,
  onRestart,
  onResume,
  onOpenSettings,
}) => {
  // Fire confetti on win
  useEffect(() => {
    if (isWin) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#a855f7', '#f97316', '#22c55e', '#eab308'],
      });
    }
  }, [isWin]);

  if (!isGameOver && !isWin && !isPaused) return null;

  const getFormattedTime = () => {
    if (!stats.startTime) return '00:00.000';
    const elapsed = stats.endTime ? stats.endTime - stats.startTime : stats.elapsedMs;
    const mins = Math.floor(elapsed / 60000);
    const secs = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor(elapsed % 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(3, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#0b0e1b]/95 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(0,229,255,0.25)] flex flex-col items-center text-center">
        {/* Title */}
        {isWin && (
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(251,191,36,0.4)]">
              <Trophy size={32} className="text-amber-400" />
            </div>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 tracking-wider uppercase italic">
              STAGE CLEAR!
            </h2>
            <p className="text-xs font-orbitron text-cyan-300/80 tracking-widest mt-1">
              40 LINES COMPLETED
            </p>
          </div>
        )}

        {isGameOver && !isWin && (
          <div className="flex flex-col items-center mb-6">
            <h2 className="font-orbitron font-black text-3xl md:text-4xl text-rose-500 tracking-wider uppercase italic drop-shadow-[0_0_20px_rgba(244,63,94,0.6)]">
              GAME OVER
            </h2>
            <p className="text-xs font-orbitron text-white/50 tracking-widest mt-1">
              {mode} ATTEMPT ENDED
            </p>
          </div>
        )}

        {isPaused && !isGameOver && !isWin && (
          <div className="flex flex-col items-center mb-6">
            <h2 className="font-orbitron font-black text-3xl md:text-4xl text-white tracking-wider uppercase italic drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              PAUSED
            </h2>
            <p className="text-xs font-orbitron text-cyan-400/80 tracking-widest mt-1">
              SESSION ON HOLD
            </p>
          </div>
        )}

        {/* Detailed Stats Breakdown */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase">FINAL TIME</span>
            <span className="font-mono font-bold text-lg text-white mt-0.5">
              {getFormattedTime()}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase flex items-center gap-1">
              <Zap size={10} className="text-amber-400" /> PPS
            </span>
            <span className="font-mono font-bold text-lg text-amber-400 mt-0.5">
              {stats.pps.toFixed(2)}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase flex items-center gap-1">
              <Activity size={10} className="text-fuchsia-400" /> APM
            </span>
            <span className="font-mono font-bold text-lg text-fuchsia-400 mt-0.5">
              {stats.apm.toFixed(1)}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase">SCORE</span>
            <span className="font-orbitron font-bold text-base text-yellow-400 mt-0.5 truncate max-w-full">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase flex items-center gap-1">
              <Target size={10} className="text-cyan-400" /> LINES
            </span>
            <span className="font-orbitron font-bold text-base text-cyan-300 mt-0.5">
              {stats.lines}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-orbitron text-white/40 uppercase flex items-center gap-1">
              <Flame size={10} className="text-orange-400" /> MAX COMBO
            </span>
            <span className="font-orbitron font-bold text-base text-orange-400 mt-0.5">
              {Math.max(0, stats.maxCombo)}x
            </span>
          </div>
        </div>

        {/* Action Clear Breakdown (Quads, T-Spins, PCs) */}
        {(stats.quads > 0 || stats.tspins > 0 || stats.allClears > 0) && (
          <div className="w-full flex items-center justify-center gap-4 py-2 px-3 bg-white/5 rounded-xl border border-white/5 text-xs font-mono text-white/70 mb-4">
            {stats.quads > 0 && (
              <span>
                <b className="text-cyan-400">{stats.quads}</b> Quads
              </span>
            )}
            {stats.tspins > 0 && (
              <span>
                <b className="text-purple-400">{stats.tspins}</b> T-Spins
              </span>
            )}
            {stats.allClears > 0 && (
              <span>
                <b className="text-amber-400">{stats.allClears}</b> All Clears
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          {isPaused && !isGameOver && !isWin && (
            <button
              onClick={onResume}
              className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-orbitron font-bold text-sm bg-cyan-500 text-black hover:bg-cyan-400 transition-transform active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              <Play size={16} fill="currentColor" /> RESUME
            </button>
          )}

          <button
            onClick={onRestart}
            className="flex-1 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-orbitron font-bold text-sm bg-white text-black hover:bg-white/90 transition-transform active:scale-95 shadow-[0_0_25px_rgba(255,255,255,0.3)]"
          >
            <RefreshCw size={16} /> RESTART (R)
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full sm:w-auto py-3 px-4 rounded-xl font-orbitron font-bold text-xs bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
          >
            SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
