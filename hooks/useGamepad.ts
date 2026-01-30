
import { useEffect, useRef } from 'react';

interface GamepadActions {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
}

export const useGamepad = (actions: GamepadActions) => {
  const requestRef = useRef<number>(null);
  const prevStateRef = useRef<Record<number, boolean>>({});

  const updateGamepad = () => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Pega o primeiro controle conectado

    if (gp) {
      const { buttons, axes } = gp;
      const currentState: Record<number, boolean> = {};

      // Mapeamento simplificado (Standard Gamepad Mapping)
      const isPressed = (idx: number) => buttons[idx]?.pressed;
      
      // Movimento (D-Pad ou Analógico Esquerdo)
      const left = isPressed(14) || axes[0] < -0.5;
      const right = isPressed(15) || axes[0] > 0.5;
      const down = isPressed(13) || axes[1] > 0.5;
      
      // Ações
      const rotate = isPressed(0) || isPressed(3); // A ou Y
      const hardDrop = isPressed(1) || isPressed(2); // B ou X
      const hold = isPressed(4) || isPressed(5); // L1 ou R1
      const pause = isPressed(9); // Options/Start

      // Trigger ações apenas no "press" (evitar repetição descontrolada)
      if (left && !prevStateRef.current[14]) actions.onLeft();
      if (right && !prevStateRef.current[15]) actions.onRight();
      if (down) actions.onDown(); // Down permite repetição para "soft drop"
      if (rotate && !prevStateRef.current[0]) actions.onRotate();
      if (hardDrop && !prevStateRef.current[1]) actions.onHardDrop();
      if (hold && !prevStateRef.current[4]) actions.onHold();
      if (pause && !prevStateRef.current[9]) actions.onPause();

      // Salva estado para detectar próximo clique
      buttons.forEach((b, i) => { currentState[i] = b.pressed; });
      prevStateRef.current = currentState;
    }

    requestRef.current = requestAnimationFrame(updateGamepad);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGamepad);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [actions]);
};
