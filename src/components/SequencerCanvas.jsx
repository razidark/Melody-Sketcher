import { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react';
import { 
  NOTES_COUNT,
  ALL_NOTES,
  TICKS_PER_BEAT
} from '../constants/midiConstants';
import * as Tone from 'tone';

const SequencerCanvas = forwardRef(({
  layers,
  activeLayerId,
  zoom,
  viewMode,
  playheadPosition,
  activeKeys,
  currentTheme,
  isPlaying,
  addNoteAt,
  eraseNoteAt,
  pianoKeysRef,
  totalTicks,
  BEAT_WIDTH,
  ROW_HEIGHT
}, ref) => {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const lastDrawnNoteRef = useRef(null);
  
  const sparklesRef = useRef([]);
  const hitParticlesRef = useRef([]);
  const playheadPositionRef = useRef(playheadPosition);

  // Sync playhead position in real time for animation frame loop
  useEffect(() => {
    playheadPositionRef.current = playheadPosition;
  }, [playheadPosition]);

  // Expose particle generators to parent
  useImperativeHandle(ref, () => ({
    triggerSparkle(tick, index) {
      const x = tick * BEAT_WIDTH + BEAT_WIDTH / 2;
      const y = index * ROW_HEIGHT + ROW_HEIGHT / 2;
      for (let i = 0; i < 5; i++) {
        sparklesRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 10,
          startTime: Date.now() + Math.random() * 200
        });
      }
    },
    triggerHitParticle(noteIndex, layerId) {
      if (viewMode !== 'stage') return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const KEY_WIDTH = width / NOTES_COUNT;
      const stageIndex = (ALL_NOTES.length - 1) - noteIndex;
      const x = stageIndex * KEY_WIDTH + KEY_WIDTH / 2;
      const y = canvas.height - 120; // PIANO_TOP

      const layer = layers.find(l => l.id === layerId);
      const color = layer?.color || '#ffffff';

      // Create 16 particles for a gorgeous glass-shatter firework effect
      for (let i = 0; i < 16; i++) {
        hitParticlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 10,
          vy: -Math.random() * 8 - 4,
          size: Math.random() * 2 + 1,
          color,
          alpha: 1,
          life: 1.0,
          decay: Math.random() * 0.04 + 0.015
        });
      }

      // Ripple wave ring
      hitParticlesRef.current.push({
        x,
        y,
        isRipple: true,
        size: 4,
        maxSize: 45,
        color,
        alpha: 0.9,
        decay: 0.04
      });
    },
    getScrollContainer() {
      return scrollContainerRef.current;
    }
  }));

  // Sparkle generator helper
  const createSparkle = useCallback((tick, index) => {
    const x = tick * BEAT_WIDTH + BEAT_WIDTH / 2;
    const y = index * ROW_HEIGHT + ROW_HEIGHT / 2;
    for (let i = 0; i < 5; i++) {
      sparklesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        startTime: Date.now() + Math.random() * 200
      });
    }
  }, [BEAT_WIDTH, ROW_HEIGHT]);

  // Redraw grid callback
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = scrollContainerRef.current;
    if (!canvas || !container) return;

    const clientWidth = container.clientWidth;
    const clientHeight = container.clientHeight;
    const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

    if (viewMode === 'studio') {
      if (canvas.width !== clientWidth) canvas.width = clientWidth;
      if (canvas.height !== clientHeight) canvas.height = clientHeight;
    } else {
      const stageW = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const stageH = typeof window !== 'undefined' ? window.innerHeight - 280 : 800;
      if (canvas.width !== stageW) canvas.width = stageW;
      if (canvas.height !== stageH) canvas.height = stageH;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const isStage = viewMode === 'stage';
    const KEY_WIDTH = width / NOTES_COUNT;
    const STAGE_BEAT_HEIGHT = 60 * zoom;
    const PIANO_HEIGHT = 120;
    const PIANO_TOP = height - PIANO_HEIGHT;

    // Viewport Culling limits
    let minX, maxX, minY, maxY;
    if (isStage) {
      minX = 0; maxX = width;
      minY = 0; maxY = PIANO_TOP;
    } else {
      minX = -BEAT_WIDTH * 2;
      maxX = clientWidth + BEAT_WIDTH * 2;
      minY = -ROW_HEIGHT * 2;
      maxY = clientHeight + ROW_HEIGHT * 2;
    }

    ctx.clearRect(0, 0, width, height);

    if (!isStage) {
      const startTick = Math.max(0, Math.floor(scrollLeft / BEAT_WIDTH));
      const endTick = Math.min(totalTicks, Math.ceil((scrollLeft + clientWidth) / BEAT_WIDTH));

      // Studio grid rows
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const y = i * ROW_HEIGHT;
        if (y + ROW_HEIGHT < scrollTop || y > scrollTop + clientHeight) continue;
        
        const canvasY = y - scrollTop;
        const isC = note.name.startsWith('C') && !note.name.includes('#');
        if (isC) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
          ctx.fillRect(0, canvasY, clientWidth, ROW_HEIGHT);
        } else if (note.name.includes('#')) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(0, canvasY, clientWidth, ROW_HEIGHT);
        }
        
        ctx.strokeStyle = isC ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = isC ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(clientWidth, canvasY);
        ctx.stroke();
      }

      // Studio grid columns
      for (let i = startTick; i <= endTick; i++) {
        const x = i * BEAT_WIDTH;
        const canvasX = x - scrollLeft;
        const isBar = i % 4 === 0;
        ctx.strokeStyle = isBar ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = isBar ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, clientHeight);
        ctx.stroke();
        if (isBar) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = 'bold 10px Inter';
          ctx.fillText(`${(i / 4) + 1}`, canvasX + 5, 15);
        }
      }
    } else {
      // Stage Mode backdrop columns
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const stageIndex = (ALL_NOTES.length - 1) - i;
        const x = stageIndex * KEY_WIDTH;
        const isSharp = note.name.includes('#');
        ctx.fillStyle = isSharp ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)';
        ctx.fillRect(x, 0, KEY_WIDTH, PIANO_TOP);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeRect(x, 0, KEY_WIDTH, PIANO_TOP);
      }

      // Light beams shooting up from active keys
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const stageIndex = (ALL_NOTES.length - 1) - i;
        const x = stageIndex * KEY_WIDTH;
        const isActive = activeKeys[note.name];
        if (isActive) {
          const gradient = ctx.createLinearGradient(x + KEY_WIDTH / 2, PIANO_TOP, x + KEY_WIDTH / 2, 0);
          const beamColor = typeof isActive === 'string' ? isActive : (activeLayer.color || '#ffffff');
          gradient.addColorStop(0, `${beamColor}99`);
          gradient.addColorStop(0.4, `${beamColor}3d`);
          gradient.addColorStop(1, `${beamColor}00`);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, 0, KEY_WIDTH, PIANO_TOP);

          // Add a beautiful neon flare splash at the bottom base on collision!
          const flare = ctx.createRadialGradient(x + KEY_WIDTH / 2, PIANO_TOP, 0, x + KEY_WIDTH / 2, PIANO_TOP, KEY_WIDTH * 1.5);
          flare.addColorStop(0, '#ffffff');
          flare.addColorStop(0.3, `${beamColor}cc`);
          flare.addColorStop(1, `${beamColor}00`);
          ctx.fillStyle = flare;
          ctx.beginPath();
          ctx.arc(x + KEY_WIDTH / 2, PIANO_TOP, KEY_WIDTH * 1.5, 0, Math.PI, true);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Render notes
    let visibleCount = 0;
    const activeVisibleNotes = [];
    ctx.lineWidth = 1;

    let realPlayhead = playheadPositionRef.current;
    if (isPlaying && Tone.Transport.state === 'started') {
      const ticks = Tone.Transport.getTicksAtTime(Tone.now());
      realPlayhead = (ticks / (Tone.Transport.PPQ / TICKS_PER_BEAT)) % totalTicks;
    }

    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const isMain = layer.id === activeLayerId;
      const lNotes = layer.notes;
      const layerColor = layer.color || '#ffffff';

      for (let n = 0; n < lNotes.length; n++) {
        const note = lNotes[n];
        let nx, ny, nw, nh;

        if (isStage) {
          const stageIndex = (ALL_NOTES.length - 1) - note.index;
          nx = stageIndex * KEY_WIDTH;
          
          // Fix wrap-around visually (if note is at tick 0 and playhead is at 127)
          let distance = note.tick - realPlayhead;
          if (distance < -totalTicks / 2) distance += totalTicks;
          
          ny = PIANO_TOP - distance * STAGE_BEAT_HEIGHT;
          nw = KEY_WIDTH - 2;
          nh = STAGE_BEAT_HEIGHT - 2;
        } else {
          nx = note.tick * BEAT_WIDTH - scrollLeft;
          ny = note.index * ROW_HEIGHT - scrollTop;
          nw = BEAT_WIDTH - 4;
          nh = ROW_HEIGHT - 4;
        }

        // Culling
        if (nx + nw >= minX && nx <= maxX && ny + nh >= minY && ny <= maxY) {
          if (isStage) {
            const isStriking = (ny + nh >= PIANO_TOP - 15) && (ny + nh <= PIANO_TOP + 15);
            
            // Glowing trail above the falling note
            const trailLen = nh * 4;
            const trailGradient = ctx.createLinearGradient(nx, ny, nx, ny - trailLen);
            trailGradient.addColorStop(0, `${layerColor}4d`);
            trailGradient.addColorStop(0.5, `${layerColor}1a`);
            trailGradient.addColorStop(1, `${layerColor}00`);
            
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = trailGradient;
            ctx.fillRect(nx + 1.5, ny - trailLen, nw - 2, trailLen);
            ctx.restore();

            // Main Glass/Translucent fill
            ctx.save();
            const noteGradient = ctx.createLinearGradient(nx, ny, nx + nw, ny + nh);
            noteGradient.addColorStop(0, `${layerColor}99`); // Semi-transparent base
            noteGradient.addColorStop(1, `${layerColor}40`); // Deeper translucency at bottom
            ctx.fillStyle = noteGradient;
            
            ctx.shadowBlur = isMain ? 24 : 12;
            ctx.shadowColor = layerColor;
            
            ctx.beginPath();
            const rad = Math.min(6, nw / 2 - 1);
            ctx.roundRect(nx + 1, ny + 1, nw - 1, nh - 1, rad);
            ctx.fill();
            ctx.restore();

            // Glass diagonal glossy sheen
            ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.beginPath();
            ctx.moveTo(nx + 1.5, ny + 1.5);
            ctx.lineTo(nx + nw * 0.55, ny + 1.5);
            ctx.lineTo(nx + nw * 0.25, ny + nh - 1.5);
            ctx.lineTo(nx + 1.5, ny + nh - 1.5);
            ctx.closePath();
            ctx.fill();

            // Prism Chromatic Aberration Stroke (refracting border)
            ctx.save();
            ctx.lineWidth = 1;
            ctx.globalCompositeOperation = 'screen';
            
            // Left boundary refraction (red-pink)
            ctx.strokeStyle = 'rgba(255, 46, 147, 0.5)';
            ctx.beginPath();
            ctx.roundRect(nx + 0.5, ny + 1, nw - 1, nh - 1, rad);
            ctx.stroke();

            // Right boundary refraction (cyan)
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.beginPath();
            ctx.roundRect(nx + 1.5, ny + 1, nw - 1, nh - 1, rad);
            ctx.stroke();
            
            // Solid center border
            ctx.strokeStyle = `${layerColor}cc`;
            ctx.beginPath();
            ctx.roundRect(nx + 1, ny + 1, nw - 1, nh - 1, rad);
            ctx.stroke();
            ctx.restore();

            // Impact scaling and explosion flare
            if (isStriking) {
              ctx.save();
              ctx.shadowBlur = 50;
              ctx.shadowColor = layerColor;
              
              // Scale slightly on impact
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(nx - 1, ny, nw + 3, nh, rad + 2);
              ctx.fill();
              
              // Draw white-hot energy core
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 20;
              ctx.shadowColor = '#ffffff';
              ctx.beginPath();
              ctx.roundRect(nx + 3, ny + 3, nw - 5, nh - 5, rad);
              ctx.fill();
              ctx.restore();
            } else {
              // Top rim highlight for 3D bevel effect
              ctx.fillStyle = 'rgba(255,255,255,0.9)';
              ctx.fillRect(nx + 3, ny + 2, nw - 5, 2);
            }
            
            if (isMain) {
              activeVisibleNotes.push({ ...note, nx, ny, nw, nh });
            }
            visibleCount++;
          } else if (isMain) {
            activeVisibleNotes.push({ ...note, nx, ny, nw, nh });
            visibleCount++;
          } else {
            ctx.fillStyle = `${layerColor}1a`;
            ctx.strokeStyle = `${layerColor}4d`;
            ctx.beginPath();
            ctx.roundRect(nx + 2, ny + 2, nw, nh, 4);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }

    // Glowing shadows for active track (Studio Mode only)
    const isHeavyLoad = visibleCount > 200;
    const trackColor = activeLayer.color || '#ffffff';
    
    if (!isStage) {
      for (let i = 0; i < activeVisibleNotes.length; i++) {
        const note = activeVisibleNotes[i];
        const { nx, ny, nw, nh } = note;
        
        // Glow effect
        if (!isHeavyLoad) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = trackColor;
        }

        // Translucent gradient fill
        const noteGrad = ctx.createLinearGradient(nx, ny, nx, ny + nh);
        noteGrad.addColorStop(0, `${trackColor}f0`);
        noteGrad.addColorStop(1, `${trackColor}b0`);
        ctx.fillStyle = noteGrad;

        ctx.beginPath();
        ctx.roundRect(nx + 1, ny + 1, nw, nh, 5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Diagonal glass sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(nx + 1.5, ny + 1.5);
        ctx.lineTo(nx + nw * 0.55, ny + 1.5);
        ctx.lineTo(nx + nw * 0.25, ny + nh - 1.5);
        ctx.lineTo(nx + 1.5, ny + nh - 1.5);
        ctx.closePath();
        ctx.fill();

        // White bezel rim highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(nx + 2.5, ny + 1.5, nw - 4, 1.5);

        // Border stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx + 1, ny + 1, nw, nh, 5);
        ctx.stroke();
      }

      // Sparkles animation (Studio)
      const now = Date.now();
      const activeSparkles = sparklesRef.current.filter(s => now - s.startTime < 1000);
      for (let si = 0; si < activeSparkles.length; si++) {
        const s = activeSparkles[si];
        const age = (now - s.startTime) / 1000;
        const opacity = 1 - age;
        const sx = s.x - scrollLeft + Math.sin(age * 10) * 10;
        const sy = s.y - scrollTop - age * 30;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * (1 - age), 0, Math.PI * 2);
        ctx.fill();
      }
      sparklesRef.current = activeSparkles;
    }

    // Piano keys & particles (Stage)
    if (isStage) {
      // White Keys
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const stageIndex = (ALL_NOTES.length - 1) - i;
        const x = stageIndex * KEY_WIDTH;
        const isSharp = note.name.includes('#');
        const isActive = activeKeys[note.name];

        if (!isSharp) {
          const keyColor = isActive ? (typeof isActive === 'string' ? isActive : activeLayer.color) : '#ffffff';
          ctx.fillStyle = keyColor;
          ctx.beginPath();
          ctx.roundRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT, [0, 0, 6, 6]);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          if (isActive) {
            // Draw a bright neon gradient glow on white keys
            const keyGlow = ctx.createLinearGradient(x, PIANO_TOP, x, PIANO_TOP + PIANO_HEIGHT);
            keyGlow.addColorStop(0, 'rgba(255,255,255,0.8)');
            keyGlow.addColorStop(0.3, `${keyColor}80`);
            keyGlow.addColorStop(1, `${keyColor}00`);
            ctx.fillStyle = keyGlow;
            ctx.fillRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT);
          } else {
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            ctx.fillRect(x, PIANO_TOP, KEY_WIDTH, 12);
          }
        }
      }
      // Black Keys
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const stageIndex = (ALL_NOTES.length - 1) - i;
        const x = stageIndex * KEY_WIDTH;
        if (note.name.includes('#')) {
          const isActive = activeKeys[note.name];
          const keyColor = isActive ? (typeof isActive === 'string' ? isActive : activeLayer.color) : '#111115';
          ctx.fillStyle = keyColor;
          ctx.beginPath();
          ctx.roundRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT * 0.62, [0, 0, 4, 4]);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.stroke();
          
          if (isActive) {
            // Draw gradient glow on black keys
            const keyGlow = ctx.createLinearGradient(x, PIANO_TOP, x, PIANO_TOP + PIANO_HEIGHT * 0.62);
            keyGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
            keyGlow.addColorStop(0.4, `${keyColor}99`);
            keyGlow.addColorStop(1, `${keyColor}00`);
            ctx.fillStyle = keyGlow;
            ctx.fillRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT * 0.62);
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(x + 1, PIANO_TOP + 1, KEY_WIDTH - 2, 4);
          }
        }
      }

      // Hit particles
      const particles = hitParticlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        
        if (p.isRipple) {
          p.size += (p.maxSize - p.size) * 0.1;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }, [layers, activeLayerId, viewMode, zoom, BEAT_WIDTH, ROW_HEIGHT, totalTicks, activeKeys, isPlaying]);

  // Pointer interactions
  const handlePointerDown = (e) => {
    if (viewMode === 'stage') return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;
    const y = e.clientY - rect.top + container.scrollTop;

    const tick = Math.floor(x / BEAT_WIDTH);
    const index = Math.floor(y / ROW_HEIGHT);

    if (tick < 0 || tick >= totalTicks || index < 0 || index >= NOTES_COUNT) return;

    if (e.button === 2) {
      isErasingRef.current = true;
      eraseNoteAt(tick, index);
    } else {
      isDrawingRef.current = true;
      addNoteAt(tick, index);
      createSparkle(tick, index);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current && !isErasingRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;
    const y = e.clientY - rect.top + container.scrollTop;

    const tick = Math.floor(x / BEAT_WIDTH);
    const index = Math.floor(y / ROW_HEIGHT);

    if (tick < 0 || tick >= totalTicks || index < 0 || index >= NOTES_COUNT) return;
    if (lastDrawnNoteRef.current?.tick === tick && lastDrawnNoteRef.current?.index === index) return;
    
    if (isErasingRef.current) {
      eraseNoteAt(tick, index);
    } else if (isDrawingRef.current) {
      addNoteAt(tick, index);
      createSparkle(tick, index);
    }
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    isErasingRef.current = false;
    lastDrawnNoteRef.current = null;
  };

  // Scroll sync
  const handleScroll = () => {
    if (viewMode === 'studio') {
      if (pianoKeysRef.current && scrollContainerRef.current) {
        pianoKeysRef.current.scrollTop = scrollContainerRef.current.scrollTop;
      }
      drawGrid();
    }
  };

  // Redraw loops
  useEffect(() => {
    drawGrid();
    const handleResize = () => {
      drawGrid();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawGrid]);

  useEffect(() => {
    if (viewMode === 'stage' || isPlaying) {
      let animationFrame;
      const render = () => {
        drawGrid();
        animationFrame = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationFrame);
    } else {
      drawGrid();
      if (sparklesRef.current.length > 0) {
        let animationFrame;
        const render = () => {
          drawGrid();
          if (sparklesRef.current.length > 0) {
            animationFrame = requestAnimationFrame(render);
          }
        };
        render();
        return () => {
          if (animationFrame) cancelAnimationFrame(animationFrame);
        };
      }
    }
  }, [drawGrid, viewMode, isPlaying]);

  return (
    <div 
      className="flex-1 overflow-auto relative scrollbar-studio" 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div 
        style={{ 
          width: `${totalTicks * BEAT_WIDTH}px`, 
          height: `${ALL_NOTES.length * ROW_HEIGHT}px` 
        }} 
        className="absolute top-0 left-0 pointer-events-none"
      />
      <canvas ref={canvasRef} className="block cursor-crosshair sticky top-0 left-0" />
      {viewMode === 'studio' && (
        <>
          <div 
            className="absolute top-0 bottom-0 pointer-events-none z-[5] opacity-25"
            style={{
              background: `linear-gradient(to left, ${currentTheme.color}35, transparent)`,
              width: `${Math.min(160, playheadPosition * BEAT_WIDTH)}px`,
              left: `${Math.max(0, playheadPosition * BEAT_WIDTH - 160)}px`
            }}
          />
          <div 
            id="studio-playhead-line"
            className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, #fff, ${currentTheme.color})`,
              boxShadow: `0 0 12px 1px ${currentTheme.color}`,
              left: `${playheadPosition * BEAT_WIDTH}px`
            }}
          />
        </>
      )}
    </div>
  );
});

SequencerCanvas.displayName = 'SequencerCanvas';

export default SequencerCanvas;
