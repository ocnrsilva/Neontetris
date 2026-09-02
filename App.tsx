import React, { useState, useEffect, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { HoldDisplay } from './components/HoldDisplay';
import { QueueDisplay } from './components/QueueDisplay';
import { StatsHUD } from './components/StatsHUD';
import { GameModeSelector } from './components/GameModeSelector';
import { SettingsModal } from './components/SettingsModal';
import { MobileControls } from './components/MobileControls';
import { Overlay } from './components/Overlay';
import { useGameLogic } from './hooks/useGameLogic';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useGamepad } from './hooks/useGamepad';
import { GameMode } from './types';
import { Play, Pause, RefreshCw, Settings, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';
import { sound } from './utils/audio';

const App: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('40L');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const {
    state,
    handling,
    setHandling,
    keyBindings,
    setKeyBindings,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotateCW,
    rotateCCW,
    rotate180,
    hold,
    resetGame,
    togglePause,
  } = useGameLogic(selectedMode);

  const { audioData, startAudio } = useAudioAnalyzer();

  // Gamepad integration
  useGamepad({
    onLeft: moveLeft,
    onRight: moveRight,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop,
    onRotateCW: rotateCW,
    onRotateCCW: rotateCCW,
    onRotate180: rotate180,
    onHold: hold,
    onPause: togglePause,
    onRestart: () => resetGame(),
  });

  const handleStartSession = (modeToStart: GameMode = selectedMode) => {
    setShowStart(false);
    startAudio();
    resetGame(modeToStart);
  };

  const handleModeChange = (newMode: GameMode) => {
    setSelectedMode(newMode);
    resetGame(newMode);
  };

  const toggleMute = () => {
    if (isMuted) {
      sound.setVolumes(handling.sfxVolume, handling.bgmVolume);
      setIsMuted(false);
    } else {
      sound.setVolumes(0, 0);
      setIsMuted(true);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#06070c] overflow-hidden flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 tetrio-grid-bg select-none">
      <BackgroundCyberGrid audioData={audioData} />
      <div className="fixed inset-0 pointer-events-none z-20 scanlines-overlay" />

      {/* Top Header Bar */}
      <header className="relative z-30 w-full max-w-6xl flex items-center justify-between px-2 sm:px-4 py-1">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl p-1 bg-[#090c17] border border-cyan-500/40 flex items-center justify-center shadow-[0_0_18px_rgba(0,229,255,0.4)]">
            <img src="/favicon.svg" alt="Neon Tetris Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-orbitron font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
              NEON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TETRIS</span>
            </h1>
            <p className="text-[9px] font-mono text-cyan-400/60 uppercase tracking-widest hidden sm:block">
              TETR.IO SRS+ Engine • 7-Bag
            </p>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="hidden md:block">
          <GameModeSelector currentMode={selectedMode} onSelectMode={handleModeChange} />
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Settings & Keybinds"
          >
            <Settings size={16} />
          </button>
          <button
            type="button"
            onClick={() => resetGame()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Restart Game (R)"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-8 w-full max-w-6xl my-auto">
        
        {/* Left Column (Hold Piece & Live Stats HUD) */}
        <div className="hidden md:flex flex-col gap-3 w-36 lg:w-44 self-center">
          <HoldDisplay
            holdPiece={state.holdPiece}
            canHold={state.canHold}
            audioData={audioData}
          />
          <StatsHUD
            stats={state.stats}
            mode={state.mode}
            isPaused={state.isPaused}
            isGameOver={state.isGameOver}
            isWin={state.isWin}
            isCountdown={state.isCountdown}
          />
        </div>

        {/* Center: Canvas GameBoard Matrix */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Mobile Top Stats Bar */}
          <div className="md:hidden flex items-center justify-between w-full max-w-[320px] mb-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 border border-white/10 rounded-lg scale-90 origin-left">
                <HoldDisplay holdPiece={state.holdPiece} canHold={state.canHold} audioData={audioData} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-orbitron text-white/40 uppercase">Lines</p>
                <p className="font-orbitron font-bold text-sm text-cyan-300">
                  {state.mode === '40L' ? `${Math.max(0, 40 - state.lines)}/40` : state.lines}
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-2">
              <div>
                <p className="text-[9px] font-orbitron text-white/40 uppercase">PPS</p>
                <p className="font-mono font-bold text-sm text-amber-400">{state.stats.pps.toFixed(2)}</p>
              </div>
              <button
                onClick={togglePause}
                className="p-2 rounded-lg bg-white/10 border border-white/15 text-white"
              >
                {state.isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <GameBoard
              matrix={state.matrix}
              activePiece={state.activePiece}
              ghostPosition={state.ghostPosition}
              audioData={audioData}
              lockProgress={state.lockProgress}
              boardShake={state.boardShake}
              actionSplashes={state.actionSplashes}
              isCountdown={state.isCountdown}
              countdownValue={state.countdownValue}
              ghostOpacity={handling.ghostOpacity}
            />

            {/* In-Game Overlay Modals */}
            <Overlay
              isGameOver={state.isGameOver}
              isWin={state.isWin}
              isPaused={state.isPaused}
              mode={state.mode}
              stats={state.stats}
              onRestart={() => resetGame()}
              onResume={togglePause}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>

        {/* Right Column (5-Piece Next Queue & Controls Info) */}
        <div className="hidden md:flex flex-col gap-3 w-36 lg:w-44 self-center">
          <QueueDisplay nextQueue={state.nextQueue} audioData={audioData} />

          {/* Quick Key Guide Card */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-white/40 space-y-1">
            <div className="flex justify-between"><span>Rotate CW</span><span className="text-cyan-400 font-bold">↑ / X</span></div>
            <div className="flex justify-between"><span>Rotate CCW</span><span className="text-cyan-400 font-bold">Z</span></div>
            <div className="flex justify-between"><span>Hard Drop</span><span className="text-white font-bold">SPACE</span></div>
            <div className="flex justify-between"><span>Hold</span><span className="text-cyan-400 font-bold">C / SHIFT</span></div>
            <div className="flex justify-between"><span>Restart</span><span className="text-rose-400 font-bold">R</span></div>
          </div>
        </div>
      </main>

      {/* Mobile Touch Controls */}
      <MobileControls
        onLeft={moveLeft}
        onRight={moveRight}
        onSoftDrop={softDrop}
        onHardDrop={hardDrop}
        onRotateCW={rotateCW}
        onRotateCCW={rotateCCW}
        onRotate180={rotate180}
        onHold={hold}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        handling={handling}
        onUpdateHandling={setHandling}
        keyBindings={keyBindings}
        onUpdateKeyBindings={setKeyBindings}
      />

      {/* Start Screen Overlay */}
      {showStart && (
        <div className="fixed inset-0 z-50 bg-[#06070c]/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in backdrop-blur-xl pointer-events-auto">
          <div className="w-20 h-20 rounded-2xl p-2 bg-[#090c17]/90 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.45)] mb-6 animate-pulse">
            <img src="/favicon.svg" alt="Neon Tetris Icon" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-black text-white tracking-tight italic mb-2">
            NEON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500">TETRIS</span>
          </h1>
          <p className="text-cyan-400/80 font-mono text-xs sm:text-sm tracking-widest uppercase mb-8 max-w-md">
            Competitive Modern Stacker • TETR.IO Handling & SRS+
          </p>

          {/* Mode Selector on Start */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg">
            {(['40L', 'BLITZ', 'MARATHON', 'ZEN'] as GameMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMode(m)}
                className={`px-4 py-2 rounded-xl text-xs font-orbitron font-bold tracking-wider transition-all cursor-pointer ${
                  selectedMode === m
                    ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-105'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {m === '40L' ? '40 LINES (SPRINT)' : m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleStartSession(selectedMode)}
            className="px-10 py-4 rounded-full bg-white text-black font-orbitron font-black text-base hover:scale-105 hover:bg-white/90 transition-transform active:scale-95 shadow-[0_0_35px_rgba(255,255,255,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <Play size={18} fill="currentColor" /> START GAME
          </button>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-[11px] font-mono text-white/40 max-w-md">
            <span>Arrow Keys / WASD: Move</span>
            <span>Space: Hard Drop</span>
            <span>C / Shift: Hold</span>
            <span>R: Instant Restart</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Subtle Cybernetic Background particles
const BackgroundCyberGrid: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 0.5,
        color: ['rgba(0, 229, 255, 0.25)', 'rgba(168, 85, 247, 0.2)', 'rgba(59, 130, 246, 0.2)'][
          Math.floor(Math.random() * 3)
        ],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const intensity = audioData.slice(0, 6).reduce((a, b) => a + b, 0) / (6 * 255 || 1);

      particles.forEach(p => {
        p.x += p.vx * (1 + intensity * 6);
        p.y += p.vy * (1 + intensity * 6);

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [audioData]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default App;
