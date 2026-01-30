
import React, { useState, useEffect, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { Sidebar } from './components/Sidebar';
import { MobileControls } from './components/MobileControls';
import { Overlay } from './components/Overlay';
import { useGameLogic } from './hooks/useGameLogic';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useGamepad } from './hooks/useGamepad';
import { Play, Pause, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const { 
    state, 
    moveLeft, 
    moveRight, 
    moveDown, 
    rotate, 
    hardDrop, 
    hold, 
    resetGame, 
    togglePause 
  } = useGameLogic();
  
  const { audioData, isReady: audioReady, startAudio } = useAudioAnalyzer();
  const [showStart, setShowStart] = useState(true);

  // Suporte a Gamepad
  useGamepad({
    onLeft: moveLeft,
    onRight: moveRight,
    onDown: moveDown,
    onRotate: rotate,
    onHardDrop: hardDrop,
    onHold: hold,
    onPause: togglePause
  });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isGameOver) return;
      
      switch (e.code) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
        case 'Space': hardDrop(); break;
        case 'KeyC': hold(); break;
        case 'KeyP': togglePause(); break;
        case 'Escape': togglePause(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isGameOver, moveLeft, moveRight, moveDown, rotate, hardDrop, hold, togglePause]);

  const handleStart = () => {
    setShowStart(false);
    startAudio();
    resetGame();
  };

  return (
    <div className="relative w-screen h-screen bg-[#050505] overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-8 scanlines">
      <BackgroundFX audioData={audioData} />

      {/* Layout Responsivo: Coluna no mobile, Linha no Desktop */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 lg:gap-8 items-center justify-center w-full max-w-6xl h-full max-h-screen">
        
        {/* Lado Esquerdo (Desktop: Hold, Mobile: Hidden) */}
        <div className="hidden md:flex flex-col gap-4 w-32 lg:w-40 self-start mt-10">
           <Sidebar title="HOLD" piece={state.holdPiece} audioData={audioData} />
           <div className="mt-auto bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
             <p className="text-white/40 text-[10px] uppercase mb-1">Level</p>
             <p className="text-xl lg:text-2xl font-orbitron font-bold text-cyan-400">{state.level}</p>
           </div>
        </div>

        {/* Centro: Tabuleiro com dimensionamento dinâmico */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full h-[60vh] md:h-full">
          {/* Mobile Stats Header */}
          <div className="md:hidden flex justify-between w-full max-w-[300px] mb-2 px-2">
             <div className="text-left">
               <p className="text-[10px] text-white/40 uppercase">Score</p>
               <p className="text-lg font-orbitron text-yellow-400 font-bold">{state.score}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-white/40 uppercase">Next</p>
               <div className="w-8 h-8 opacity-80 scale-50 origin-top-right">
                  <Sidebar title="" piece={state.nextPiece} audioData={audioData} />
               </div>
             </div>
          </div>

          <div className="relative p-1.5 bg-gradient-to-b from-white/10 to-transparent rounded-xl shadow-2xl">
             <GameBoard 
               grid={state.grid} 
               activePiece={state.activePiece} 
               ghostPosition={state.ghostPosition}
               audioData={audioData}
             />
             
             {state.isPaused && !state.isGameOver && !showStart && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md rounded-xl z-20">
                 <h2 className="text-3xl font-orbitron font-black text-white mb-6">PAUSADO</h2>
                 <button 
                   onClick={togglePause}
                   className="bg-cyan-500 text-black px-6 py-2.5 rounded-full font-bold active:scale-95 flex items-center gap-2"
                 >
                   <Play size={18} fill="currentColor"/> RETOMAR
                 </button>
               </div>
             )}

             {state.isGameOver && (
               <Overlay 
                 title="FIM DE JOGO" 
                 score={state.score} 
                 lines={state.lines} 
                 onAction={resetGame} 
                 actionIcon={<RefreshCw size={24}/>}
                 actionText="RECOMEÇAR"
               />
             )}
          </div>
        </div>

        {/* Lado Direito (Desktop: Next/Stats) */}
        <div className="hidden md:flex flex-col gap-4 w-32 lg:w-48 self-start mt-10">
          <Sidebar title="PRÓXIMO" piece={state.nextPiece} audioData={audioData} />
          
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
            <p className="text-white/40 text-[10px] uppercase">Pontos</p>
            <p className="text-xl lg:text-3xl font-orbitron font-bold text-yellow-400 truncate">{state.score.toLocaleString()}</p>
            
            <p className="text-white/40 text-[10px] uppercase mt-4">Linhas</p>
            <p className="text-lg lg:text-2xl font-orbitron font-semibold text-white/80">{state.lines}</p>
          </div>

          <div className="flex gap-2">
             <button onClick={togglePause} className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
                {state.isPaused ? <Play size={20}/> : <Pause size={20}/>}
             </button>
             <button onClick={resetGame} className="flex-1 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
                <RefreshCw size={20}/>
             </button>
          </div>
        </div>
      </div>

      <MobileControls 
        onLeft={moveLeft} 
        onRight={moveRight} 
        onDown={moveDown} 
        onRotate={rotate} 
        onHardDrop={hardDrop} 
        onHold={hold}
      />

      {showStart && (
        <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-5xl md:text-8xl font-orbitron font-black text-white mb-2 tracking-tighter italic">
            NEON<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">PULSE</span>
          </h1>
          <p className="text-cyan-400/60 font-medium mb-10 tracking-[0.2em] uppercase text-xs">Multi-Platform Arcade</p>
          <button 
            onClick={handleStart}
            className="group relative px-10 py-4 rounded-full bg-white text-black font-black text-lg hover:scale-110 transition-transform"
          >
            START SESSION
          </button>
          <div className="mt-12 text-[10px] opacity-30 flex flex-col gap-1 uppercase tracking-widest">
             <p>Keyboard • Touch • Gamepad</p>
             <p>Setas: Mover • Espaço: Drop • C: Hold</p>
          </div>
        </div>
      )}
    </div>
  );
};

const BackgroundFX: React.FC<{ audioData: number[] }> = ({ audioData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const particles: any[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        color: `hsla(${Math.random() * 40 + 190}, 70%, 50%, 0.3)`
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const intensity = audioData.reduce((a, b) => a + b, 0) / (audioData.length * 255 || 1);
      particles.forEach(p => {
        p.x += p.vx * (1 + intensity * 20);
        p.y += p.vy * (1 + intensity * 20);
        if (p.x < 0) p.x = canvas.width; else if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; else if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize(); animate();
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, [audioData]);
  return <canvas ref={canvasRef} className="particles-bg" />;
};

export default App;
