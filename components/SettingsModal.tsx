import React, { useState } from 'react';
import { HandlingConfig, KeyBindings } from '../types';
import { sound } from '../utils/audio';
import { X, Sliders, Volume2, Keyboard, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  handling: HandlingConfig;
  onUpdateHandling: (newHandling: HandlingConfig) => void;
  keyBindings: KeyBindings;
  onUpdateKeyBindings: (newKeys: KeyBindings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  handling,
  onUpdateHandling,
  keyBindings,
  onUpdateKeyBindings,
}) => {
  const [tab, setTab] = useState<'handling' | 'audio' | 'keys'>('handling');
  const [currentHandling, setCurrentHandling] = useState<HandlingConfig>(handling);
  const [currentKeys, setCurrentKeys] = useState<KeyBindings>(keyBindings);
  const [listeningKey, setListeningKey] = useState<keyof KeyBindings | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateHandling(currentHandling);
    onUpdateKeyBindings(currentKeys);
    sound.setVolumes(currentHandling.sfxVolume, currentHandling.bgmVolume);
    onClose();
  };

  const handleResetDefaults = () => {
    const defaultHandling: HandlingConfig = {
      das: 130,
      arr: 10,
      sdf: 20,
      dcd: 0,
      lockDelay: 500,
      maxLockResets: 15,
      ghostOpacity: 0.4,
      screenShake: true,
      sfxVolume: 0.8,
      bgmVolume: 0.4,
    };
    setCurrentHandling(defaultHandling);
  };

  const handleKeyListen = (action: keyof KeyBindings) => {
    setListeningKey(action);
    const listener = (e: KeyboardEvent) => {
      e.preventDefault();
      setCurrentKeys(prev => ({
        ...prev,
        [action]: [e.code],
      }));
      setListeningKey(null);
      window.removeEventListener('keydown', listener);
    };
    window.addEventListener('keydown', listener, { once: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0e1b] border border-cyan-500/30 rounded-2xl w-full max-w-xl shadow-[0_0_50px_rgba(0,229,255,0.2)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-cyan-400" />
            <h2 className="font-orbitron font-bold text-lg text-white tracking-wider uppercase">
              Game Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/30 px-6 pt-2">
          <button
            onClick={() => setTab('handling')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-orbitron font-bold tracking-wider transition-colors border-b-2 ${
              tab === 'handling'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Sliders size={14} /> HANDLING
          </button>
          <button
            onClick={() => setTab('keys')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-orbitron font-bold tracking-wider transition-colors border-b-2 ${
              tab === 'keys'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Keyboard size={14} /> CONTROLS
          </button>
          <button
            onClick={() => setTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-orbitron font-bold tracking-wider transition-colors border-b-2 ${
              tab === 'audio'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Volume2 size={14} /> AUDIO & FX
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          {tab === 'handling' && (
            <div className="space-y-4">
              {/* DAS */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">
                    DAS (Delayed Auto Shift)
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{currentHandling.das} ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="5"
                  value={currentHandling.das}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, das: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-white/40">
                  Delay before continuous horizontal movement starts.
                </p>
              </div>

              {/* ARR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">
                    ARR (Auto Repeat Rate)
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {currentHandling.arr === 0 ? '0 ms (Instant)' : `${currentHandling.arr} ms`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="2"
                  value={currentHandling.arr}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, arr: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-white/40">
                  Speed of repeated movement after DAS. Set to 0 for instant teleport.
                </p>
              </div>

              {/* SDF */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">
                    SDF (Soft Drop Factor)
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {currentHandling.sdf === 0 ? 'Instant' : `${currentHandling.sdf}x`}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={currentHandling.sdf}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, sdf: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Lock Delay */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">Lock Delay</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {currentHandling.lockDelay} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  value={currentHandling.lockDelay}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, lockDelay: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white hover:underline"
                >
                  <RotateCcw size={12} /> Reset to TETR.IO standard handling
                </button>
              </div>
            </div>
          )}

          {tab === 'keys' && (
            <div className="space-y-2">
              <p className="text-xs text-white/50 mb-3">
                Click any key bind button and press a new key on your keyboard.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['moveLeft', 'Move Left'],
                    ['moveRight', 'Move Right'],
                    ['softDrop', 'Soft Drop'],
                    ['hardDrop', 'Hard Drop'],
                    ['rotateCW', 'Rotate CW'],
                    ['rotateCCW', 'Rotate CCW'],
                    ['rotate180', 'Rotate 180°'],
                    ['hold', 'Hold Piece'],
                    ['restart', 'Quick Restart'],
                    ['pause', 'Pause / Menu'],
                  ] as [keyof KeyBindings, string][]
                ).map(([action, label]) => (
                  <div
                    key={action}
                    className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-lg"
                  >
                    <span className="text-xs text-white/80 font-medium">{label}</span>
                    <button
                      onClick={() => handleKeyListen(action)}
                      className={`px-3 py-1 text-xs font-mono font-bold rounded border transition-all ${
                        listeningKey === action
                          ? 'bg-cyan-500 text-black border-cyan-400 animate-pulse'
                          : 'bg-white/10 text-cyan-300 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {listeningKey === action
                        ? 'PRESS KEY...'
                        : currentKeys[action][0] || 'NONE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'audio' && (
            <div className="space-y-4">
              {/* SFX Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">Sound Effects (SFX)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(currentHandling.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentHandling.sfxVolume}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setCurrentHandling({ ...currentHandling, sfxVolume: v });
                    sound.setVolumes(v, currentHandling.bgmVolume);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* BGM Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">Background Music (BGM)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(currentHandling.bgmVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentHandling.bgmVolume}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setCurrentHandling({ ...currentHandling, bgmVolume: v });
                    sound.setVolumes(currentHandling.sfxVolume, v);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Ghost Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-orbitron font-semibold text-white/80">Ghost Piece Opacity</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(currentHandling.ghostOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={currentHandling.ghostOpacity}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, ghostOpacity: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Screen Shake */}
              <div className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg">
                <span className="text-xs text-white/80 font-medium">Impact Screen Shake</span>
                <input
                  type="checkbox"
                  checked={currentHandling.screenShake}
                  onChange={e =>
                    setCurrentHandling({ ...currentHandling, screenShake: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-orbitron font-bold text-white/60 hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-orbitron font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            APPLY SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};
