
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, RotateCcw, ArrowDownToLine, Hand } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft, onRight, onDown, onRotate, onHardDrop, onHold
}) => {
  const btnClass = "w-14 h-14 flex items-center justify-center bg-white/10 border border-white/20 rounded-2xl active:bg-cyan-500 active:text-black transition-all touch-none shadow-lg";

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 px-4 z-40 pointer-events-none select-none">
      <div className="flex justify-between items-end max-w-md mx-auto pointer-events-auto">
        
        {/* Direcional Esquerdo */}
        <div className="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-3xl backdrop-blur-md border border-white/5">
           <button 
             onPointerDown={(e) => { e.preventDefault(); onLeft(); }} 
             className={btnClass}
           >
             <ChevronLeft size={28} />
           </button>
           <button 
             onPointerDown={(e) => { e.preventDefault(); onRight(); }} 
             className={btnClass}
           >
             <ChevronRight size={28} />
           </button>
           <button 
             onPointerDown={(e) => { e.preventDefault(); onHold(); }} 
             className={`${btnClass} !bg-blue-500/20`}
           >
             <Hand size={22} />
           </button>
           <button 
             onPointerDown={(e) => { e.preventDefault(); onDown(); }} 
             className={btnClass}
           >
             <ChevronDown size={28} />
           </button>
        </div>

        {/* Botões de Ação Direitos */}
        <div className="flex flex-col gap-3 bg-black/40 p-2 rounded-3xl backdrop-blur-md border border-white/5">
           <button 
             onPointerDown={(e) => { e.preventDefault(); onRotate(); }} 
             className={`${btnClass} w-20 h-20 !rounded-full bg-cyan-500/20 border-cyan-500/40`}
           >
             <RotateCcw size={32} />
           </button>
           <button 
             onPointerDown={(e) => { e.preventDefault(); onHardDrop(); }} 
             className={`${btnClass} !bg-white !text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]`}
           >
             <ArrowDownToLine size={24} />
           </button>
        </div>

      </div>
    </div>
  );
};
