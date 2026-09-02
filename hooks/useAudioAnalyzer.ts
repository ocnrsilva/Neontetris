import { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';

export const useAudioAnalyzer = () => {
  const [audioData, setAudioData] = useState<number[]>(() => new Array(32).fill(0));
  const [isReady, setIsReady] = useState(false);
  const animRef = useRef<number | null>(null);

  const startAudio = () => {
    sound.init();
    sound.startBGM();
    setIsReady(true);
  };

  useEffect(() => {
    const update = () => {
      const data = sound.getAudioFrequencyData();
      setAudioData(data);
      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return { audioData, isReady, startAudio };
};
