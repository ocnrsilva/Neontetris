
import { useState, useEffect, useRef } from 'react';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0));
  const [isReady, setIsReady] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAudio = async () => {
    try {
      if (audioContextRef.current) return;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      // Create a simple oscillating drone for the "music" feel if no external track
      // In a real app, we'd load an MP3.
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const analyzer = audioContext.createAnalyser();
      
      analyzer.fftSize = 64;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(55, audioContext.currentTime); // Deep bass pulse
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(analyzer);
      analyzer.connect(audioContext.destination);
      
      oscillator.start();
      
      // Also add some rhythmic pulses
      const pulseOsc = audioContext.createOscillator();
      const pulseGain = audioContext.createGain();
      pulseOsc.type = 'square';
      pulseOsc.frequency.setValueAtTime(110, audioContext.currentTime);
      pulseGain.gain.setValueAtTime(0, audioContext.currentTime);
      
      setInterval(() => {
        pulseGain.gain.exponentialRampToValueAtTime(0.02, audioContext.currentTime + 0.05);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.3);
      }, 500);

      pulseOsc.connect(pulseGain);
      pulseGain.connect(analyzer);
      pulseOsc.start();

      audioContextRef.current = audioContext;
      analyzerRef.current = analyzer;
      dataArrayRef.current = dataArray;
      setIsReady(true);
      
      const update = () => {
        if (analyzerRef.current && dataArrayRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
          setAudioData(Array.from(dataArrayRef.current));
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return { audioData, isReady, startAudio };
};
