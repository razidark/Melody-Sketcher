import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { ALL_NOTES } from '../constants/midiConstants';

export default function useGamepadController({
  gamepadCursor,
  setGamepadCursor,
  activeLayerId,
  setActiveLayerId,
  layers,
  setLayers,
  isRecording,
  setIsRecording,
  togglePlay,
  seekSeconds,
  handleUndo,
  handleRedo,
  addNoteAt,
  eraseNoteAt,
  totalTicks,
  setGamepadConnectedName
}) {
  const gamepadCursorRef = useRef(gamepadCursor);
  const activeLayerIdRef = useRef(activeLayerId);
  const layersRef = useRef(layers);
  const isRecordingRef = useRef(isRecording);
  
  // Sync refs to avoid closure staling in animation loop
  useEffect(() => {
    gamepadCursorRef.current = gamepadCursor;
    activeLayerIdRef.current = activeLayerId;
    layersRef.current = layers;
    isRecordingRef.current = isRecording;
  }, [gamepadCursor, activeLayerId, layers, isRecording]);

  const lastPressedRef = useRef({});
  const lastMoveTimeRef = useRef({ x: 0, y: 0, pan: 0, vol: 0 });

  useEffect(() => {
    let animationFrameId;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let activeGamepad = null;

      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
          activeGamepad = gamepads[i];
          break;
        }
      }

      if (activeGamepad) {
        setGamepadConnectedName(activeGamepad.id);

        const buttons = activeGamepad.buttons;
        const axes = activeGamepad.axes;
        const now = Date.now();

        // Helper to check button edge trigger (press down)
        const isPressed = (btnIndex) => {
          if (!buttons[btnIndex]) return false;
          const val = buttons[btnIndex].pressed || buttons[btnIndex].value > 0.5;
          const wasPressed = lastPressedRef.current[btnIndex];
          lastPressedRef.current[btnIndex] = val;
          return val && !wasPressed;
        };

        // --- BUTTON ACTION TRIGGERS ---

        // Button 2 (X / Square): Toggle Play
        if (isPressed(2)) {
          togglePlay();
        }

        // Button 3 (Y / Triangle): Toggle Record
        if (isPressed(3)) {
          setIsRecording(prev => !prev);
        }

        // Button 0 (A / Cross): Add Note at selector
        if (isPressed(0)) {
          const { tick, index } = gamepadCursorRef.current;
          addNoteAt(tick, index);
        }

        // Button 1 (B / Circle): Erase Note at selector
        if (isPressed(1)) {
          const { tick, index } = gamepadCursorRef.current;
          eraseNoteAt(tick, index);
        }

        // Button 4 (LB / L1): Previous Track
        if (isPressed(4)) {
          const idx = layersRef.current.findIndex(l => l.id === activeLayerIdRef.current);
          if (idx > 0) {
            setActiveLayerId(layersRef.current[idx - 1].id);
          } else if (layersRef.current.length > 0) {
            setActiveLayerId(layersRef.current[layersRef.current.length - 1].id);
          }
        }

        // Button 5 (RB / R1): Next Track
        if (isPressed(5)) {
          const idx = layersRef.current.findIndex(l => l.id === activeLayerIdRef.current);
          if (idx !== -1 && idx < layersRef.current.length - 1) {
            setActiveLayerId(layersRef.current[idx + 1].id);
          } else if (layersRef.current.length > 0) {
            setActiveLayerId(layersRef.current[0].id);
          }
        }

        // Button 6 (LT / L2): Seek -10s
        if (isPressed(6)) {
          seekSeconds(-10);
        }

        // Button 7 (RT / R2): Seek +10s
        if (isPressed(7)) {
          seekSeconds(10);
        }

        // Button 8 (Select): Undo
        if (isPressed(8)) {
          handleUndo();
        }

        // Button 9 (Start): Redo
        if (isPressed(9)) {
          handleRedo();
        }

        // --- DIRECTIONAL SELECTOR MOVEMENTS (LEFT STICK / D-PAD) ---

        // Vertical Movement (Up / Down)
        let dirY = 0;
        if (buttons[12]?.pressed) dirY = -1; // D-pad Up
        else if (buttons[13]?.pressed) dirY = 1; // D-pad Down
        else if (axes[1] < -0.4) dirY = -1; // Left Stick Up
        else if (axes[1] > 0.4) dirY = 1; // Left Stick Down

        if (dirY !== 0 && now - lastMoveTimeRef.current.y > 130) {
          setGamepadCursor(prev => {
            const nextIndex = Math.max(0, Math.min(ALL_NOTES.length - 1, prev.index + dirY));
            // Trigger transient audio preview of selected note key when moving vertically
            if (nextIndex !== prev.index) {
              const note = ALL_NOTES[nextIndex];
              const synth = Tone.Transport.state === 'started' ? null : true;
              if (synth) {
                // Trigger quick preview
                try {
                  const synthPreview = new Tone.Synth().toDestination();
                  synthPreview.volume.value = -12;
                  synthPreview.triggerAttackRelease(note.name, '16n');
                } catch {
                  // ignore
                }
              }
            }
            return { ...prev, index: nextIndex };
          });
          lastMoveTimeRef.current.y = now;
        }

        // Horizontal Movement (Left / Right)
        let dirX = 0;
        if (buttons[14]?.pressed) dirX = -1; // D-pad Left
        else if (buttons[15]?.pressed) dirX = 1; // D-pad Right
        else if (axes[0] < -0.4) dirX = -1; // Left Stick Left
        else if (axes[0] > 0.4) dirX = 1; // Left Stick Right

        if (dirX !== 0 && now - lastMoveTimeRef.current.x > 130) {
          setGamepadCursor(prev => {
            const nextTick = (prev.tick + dirX + totalTicks) % totalTicks;
            return { ...prev, tick: nextTick };
          });
          lastMoveTimeRef.current.x = now;
        }

        // --- PARAMETER CONTROL (RIGHT STICK) ---

        // Right Stick Y (Volume): axes[3]
        if (Math.abs(axes[3]) > 0.3 && now - lastMoveTimeRef.current.vol > 100) {
          const deltaVol = axes[3] < 0 ? 1 : -1; // Stick up increases volume, down decreases
          setLayers(prev => prev.map(l => {
            if (l.id === activeLayerIdRef.current) {
              const nextVol = Math.max(-60, Math.min(12, l.volume + deltaVol));
              return { ...l, volume: nextVol };
            }
            return l;
          }));
          lastMoveTimeRef.current.vol = now;
        }

        // Right Stick X (Pan): axes[2]
        if (Math.abs(axes[2]) > 0.3 && now - lastMoveTimeRef.current.pan > 100) {
          const deltaPan = axes[2] > 0 ? 0.05 : -0.05; // Stick right pans right, left pans left
          setLayers(prev => prev.map(l => {
            if (l.id === activeLayerIdRef.current) {
              const nextPan = Math.max(-1, Math.min(1, l.pan + deltaPan));
              return { ...l, pan: parseFloat(nextPan.toFixed(2)) };
            }
            return l;
          }));
          lastMoveTimeRef.current.pan = now;
        }
      } else {
        setGamepadConnectedName(null);
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    setGamepadCursor,
    setActiveLayerId,
    setLayers,
    setIsRecording,
    togglePlay,
    seekSeconds,
    handleUndo,
    handleRedo,
    addNoteAt,
    eraseNoteAt,
    totalTicks,
    setGamepadConnectedName
  ]);
}
