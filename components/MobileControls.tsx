import React, { useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCw,
  RotateCcw,
  ArrowDownToLine,
  Hand,
  Rotate3D,
} from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onRotate180: () => void;
  onHold: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onRotate180,
  onHold,
}) => {
  const repeatTimerRef = useRef<number | null>(null);

  const startRepeat = (action: () => void) => {
    action();
    // Initial DAS delay then rapid repeat
    const timeout = window.setTimeout(() => {
      const interval = window.setInterval(() => {
        action();
      }, 40);
      repeatTimerRef.current = interval;
    }, 140);
    repeatTimerRef.current = timeout;
  };

  const stopRepeat = () => {
    if (repeatTimerRef.current !== null) {
      clearTimeout(repeatTimerRef.current);
      clearInterval(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
  };

  const btnBase =
    'flex items-center justify-center rounded-2xl bg-white/10 border border-white/15 active:bg-cyan-400 active:text-black active:scale-95 transition-transform touch-none select-none shadow-md backdrop-blur-md';

  return (
    <div className="md:hidden fixed bottom-3 left-0 right-0 px-3 z-40 pointer-events-none select-none">
      <div className="flex justify-between items-end max-w-lg mx-auto pointer-events-auto gap-2">
        {/* Left Side: D-Pad & Hold */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-lg">
          <button
            onPointerDown={e => {
              e.preventDefault();
              startRepeat(onLeft);
            }}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            className={`${btnBase} w-12 h-12`}
            aria-label="Move Left"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              startRepeat(onSoftDrop);
            }}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            className={`${btnBase} w-12 h-12`}
            aria-label="Soft Drop"
          >
            <ChevronDown size={24} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              startRepeat(onRight);
            }}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            className={`${btnBase} w-12 h-12`}
            aria-label="Move Right"
          >
            <ChevronRight size={24} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              onHold();
            }}
            className={`${btnBase} col-span-3 h-10 bg-cyan-500/20 border-cyan-400/40 text-cyan-300 text-xs font-orbitron font-bold flex gap-1.5`}
            aria-label="Hold"
          >
            <Hand size={14} /> HOLD
          </button>
        </div>

        {/* Right Side: Rotations & Hard Drop */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-lg">
          <button
            onPointerDown={e => {
              e.preventDefault();
              onRotateCCW();
            }}
            className={`${btnBase} w-12 h-12 text-cyan-400 bg-cyan-500/15 border-cyan-400/30`}
            aria-label="Rotate CCW"
          >
            <RotateCcw size={20} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              onRotate180();
            }}
            className={`${btnBase} w-12 h-12 text-purple-400 bg-purple-500/15 border-purple-400/30`}
            aria-label="Rotate 180"
          >
            <Rotate3D size={20} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              onRotateCW();
            }}
            className={`${btnBase} w-12 h-12 text-cyan-300 bg-cyan-500/25 border-cyan-400/40`}
            aria-label="Rotate CW"
          >
            <RotateCw size={22} />
          </button>

          <button
            onPointerDown={e => {
              e.preventDefault();
              onHardDrop();
            }}
            className={`${btnBase} col-span-3 h-11 bg-white text-black font-orbitron font-black text-xs tracking-wider flex gap-1.5 shadow-[0_0_20px_rgba(255,255,255,0.4)]`}
            aria-label="Hard Drop"
          >
            <ArrowDownToLine size={16} /> HARD DROP
          </button>
        </div>
      </div>
    </div>
  );
};
