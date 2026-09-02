import { useEffect, useRef } from 'react';

interface GamepadActions {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onRotate180: () => void;
  onHold: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const useGamepad = (actions: GamepadActions) => {
  const requestRef = useRef<number | null>(null);
  const prevStateRef = useRef<Record<number, boolean>>({});
  const lastAxisTimeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateGamepad = () => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];

    if (gp) {
      const { buttons, axes } = gp;
      const currentState: Record<number, boolean> = {};
      const isPressed = (idx: number) => buttons[idx]?.pressed;

      const now = performance.now();

      // D-Pad
      const dpadLeft = isPressed(14);
      const dpadRight = isPressed(15);
      const dpadDown = isPressed(13);
      const dpadUp = isPressed(12);

      // Analog Stick
      const stickLeft = axes[0] < -0.5;
      const stickRight = axes[0] > 0.5;
      const stickDown = axes[1] > 0.5;

      // Triggers / Buttons (Standard mapping)
      const btnA = isPressed(0); // Rotate CW (A / Cross)
      const btnB = isPressed(1); // Rotate CCW or Cancel (B / Circle)
      const btnX = isPressed(2); // Rotate 180 (X / Square)
      const btnY = isPressed(3); // Hard Drop (Y / Triangle)
      const btnL1 = isPressed(4); // Hold
      const btnR1 = isPressed(5); // Hold
      const btnStart = isPressed(9); // Pause / Menu
      const btnSelect = isPressed(8); // Restart

      // Left Movement
      if ((dpadLeft || stickLeft) && (!prevStateRef.current[14] && now - lastAxisTimeRef.current.x > 140)) {
        actions.onLeft();
        lastAxisTimeRef.current.x = now;
      }
      // Right Movement
      if ((dpadRight || stickRight) && (!prevStateRef.current[15] && now - lastAxisTimeRef.current.x > 140)) {
        actions.onRight();
        lastAxisTimeRef.current.x = now;
      }
      // Soft Drop
      if (dpadDown || stickDown) {
        actions.onSoftDrop();
      }

      // Hard Drop (D-pad Up or Y)
      if ((dpadUp || btnY) && !prevStateRef.current[3] && !prevStateRef.current[12]) {
        actions.onHardDrop();
      }

      // Rotations
      if (btnA && !prevStateRef.current[0]) actions.onRotateCW();
      if (btnB && !prevStateRef.current[1]) actions.onRotateCCW();
      if (btnX && !prevStateRef.current[2]) actions.onRotate180();

      // Hold
      if ((btnL1 || btnR1) && !prevStateRef.current[4] && !prevStateRef.current[5]) {
        actions.onHold();
      }

      // Menu
      if (btnStart && !prevStateRef.current[9]) actions.onPause();
      if (btnSelect && !prevStateRef.current[8]) actions.onRestart();

      buttons.forEach((b, i) => {
        currentState[i] = b.pressed;
      });
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
