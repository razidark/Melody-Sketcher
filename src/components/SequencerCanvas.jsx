import { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react';
import { 
  NOTES_COUNT,
  ALL_NOTES,
  TICKS_PER_BEAT,
  NOTE_TO_KEY_LABEL
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
  ROW_HEIGHT,
  gamepadCursor,
  scrubPlayhead
}, ref) => {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const rulerCanvasRef = useRef(null);
  
  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const lastDrawnNoteRef = useRef(null);
  
  const sparklesRef = useRef([]);
  const hitParticlesRef = useRef([]);
  const playheadPositionRef = useRef(playheadPosition);

  // Draw the timeline ruler (bar numbers and beat markers)
  const drawRuler = useCallback(() => {
    const rulerCanvas = rulerCanvasRef.current;
    const container = scrollContainerRef.current;
    if (!rulerCanvas || !container || viewMode !== 'studio') return;

    const width = container.clientWidth;
    const RULER_H = 24;
    if (rulerCanvas.width !== width) rulerCanvas.width = width;
    if (rulerCanvas.height !== RULER_H) rulerCanvas.height = RULER_H;

    const ctx = rulerCanvas.getContext('2d');
    ctx.clearRect(0, 0, width, RULER_H);

    const scrollLeft = container.scrollLeft;
    const startTick = Math.max(0, Math.floor(scrollLeft / BEAT_WIDTH));
    const endTick = Math.min(totalTicks, Math.ceil((scrollLeft + width) / BEAT_WIDTH));

    // Background gradient
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, width, RULER_H);

    // Bottom border
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, RULER_H - 0.5);
    ctx.lineTo(width, RULER_H - 0.5);
    ctx.stroke();

    for (let i = startTick; i <= endTick; i++) {
      const x = i * BEAT_WIDTH - scrollLeft;
      const isBar = i % 4 === 0;
      const isBeat = i % 1 === 0;

      if (isBar) {
        // Bar line
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 2);
        ctx.lineTo(x, RULER_H - 2);
        ctx.stroke();

        // Bar number
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 9px Outfit, Inter, sans-serif';
        ctx.fillText(`${(i / 4) + 1}`, x + 4, 14);
      } else if (isBeat) {
        // Beat tick
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, RULER_H - 7);
        ctx.lineTo(x, RULER_H - 2);
        ctx.stroke();
      }
    }
  }, [viewMode, BEAT_WIDTH, totalTicks]);

  // Sync playhead position ref when prop changes (scrub, step-record, etc.)
  useEffect(() => {
    playheadPositionRef.current = playheadPosition;
    const px = playheadPosition * BEAT_WIDTH;
    const shadeEl = document.getElementById('studio-playhead-shade');
    const lineEl = document.getElementById('studio-playhead-line');
    const progEl = document.getElementById('timeline-progress-bar');
    if (shadeEl) shadeEl.style.width = `${px}px`;
    if (lineEl) lineEl.style.left = `${px}px`;
    if (progEl) progEl.style.width = `${(playheadPosition / totalTicks) * 100}%`;
    drawRuler();
  }, [playheadPosition, BEAT_WIDTH, totalTicks, drawRuler]);

  // Real-time auto-scroll that tracks the live Tone.js playhead via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || viewMode !== 'studio') return;
    let scrollAnimId;
    let prevTick = -1;
    const scrollLoop = () => {
      scrollAnimId = requestAnimationFrame(scrollLoop);
      const container = scrollContainerRef.current;
      if (!container) return;

      // Read the real-time high-precision playhead from Tone.js transport
      let currentTick = playheadPositionRef.current;
      try {
        if (Tone.Transport.state === 'started') {
          const ticks = Tone.Transport.getTicksAtTime(Tone.now());
          currentTick = (ticks / (Tone.Transport.PPQ / TICKS_PER_BEAT)) % totalTicks;
          playheadPositionRef.current = currentTick;
        }
      } catch { /* ignore */ }

      if (currentTick === prevTick) return;
      prevTick = currentTick;

      const px = currentTick * BEAT_WIDTH;
      const shadeEl = document.getElementById('studio-playhead-shade');
      const lineEl = document.getElementById('studio-playhead-line');
      const progEl = document.getElementById('timeline-progress-bar');
      if (shadeEl) shadeEl.style.width = `${px}px`;
      if (lineEl) lineEl.style.left = `${px}px`;
      if (progEl) progEl.style.width = `${(currentTick / totalTicks) * 100}%`;
      drawRuler();

      const scrollLeftVal = container.scrollLeft;
      const visibleWidth = container.clientWidth;

      // Auto-scroll when playhead goes beyond 75% of visible area
      if (px > scrollLeftVal + visibleWidth * 0.75) {
        container.scrollLeft = Math.max(0, px - visibleWidth * 0.25);
      } else if (px < scrollLeftVal) {
        // Jump back if it loops to the beginning
        container.scrollLeft = Math.max(0, px - visibleWidth * 0.15);
      }
    };
    scrollLoop();
    return () => cancelAnimationFrame(scrollAnimId);
  }, [isPlaying, viewMode, BEAT_WIDTH, totalTicks, drawRuler]);

  // Auto-scroll scroll container when gamepad cursor moves out of view
  useEffect(() => {
    if (!gamepadCursor || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cx = gamepadCursor.tick * BEAT_WIDTH;
    const cy = gamepadCursor.index * ROW_HEIGHT;
    const cw = BEAT_WIDTH;
    const ch = ROW_HEIGHT;

    const scrollLeftVal = container.scrollLeft;
    const scrollTopVal = container.scrollTop;
    const visibleWidth = container.clientWidth;
    const visibleHeight = container.clientHeight;

    // Horizontal check
    if (cx < scrollLeftVal + 40) {
      container.scrollLeft = Math.max(0, cx - 40);
    } else if (cx + cw > scrollLeftVal + visibleWidth - 40) {
      container.scrollLeft = cx + cw - visibleWidth + 40;
    }

    // Vertical check
    if (cy < scrollTopVal + 40) {
      container.scrollTop = Math.max(0, cy - 40);
    } else if (cy + ch > scrollTopVal + visibleHeight - 40) {
      container.scrollTop = cy + ch - visibleHeight + 40;
    }
  }, [gamepadCursor, BEAT_WIDTH, ROW_HEIGHT]);

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
      if (viewMode !== 'stage' && viewMode !== 'stage-h') return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const layer = layers.find(l => l.id === layerId);
      const color = layer?.color || '#ffffff';

      let x, y;
      let vxBase = 0, vyBase = 0;
      let vxSpread, vySpread;

      if (viewMode === 'stage') {
        const KEY_WIDTH = width / NOTES_COUNT;
        const stageIndex = (ALL_NOTES.length - 1) - noteIndex;
        x = stageIndex * KEY_WIDTH + KEY_WIDTH / 2;
        y = height - 120; // PIANO_TOP
        vxSpread = 10;
        vyBase = -8;
        vySpread = 4;
      } else {
        const KEY_HEIGHT = height / NOTES_COUNT;
        x = 120; // PIANO_LEFT
        y = noteIndex * KEY_HEIGHT + KEY_HEIGHT / 2;
        vxBase = 8;
        vxSpread = 4;
        vySpread = 10;
      }

      // Create 16 particles for a gorgeous glass-shatter firework effect
      for (let i = 0; i < 16; i++) {
        const vx = vxBase !== 0 
          ? (Math.random() * vxSpread + vxBase) 
          : ((Math.random() - 0.5) * vxSpread);
        const vy = vyBase !== 0 
          ? (-Math.random() * vySpread + vyBase) 
          : ((Math.random() - 0.5) * vySpread);

        hitParticlesRef.current.push({
          x,
          y,
          vx,
          vy,
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

    drawRuler();

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

    const isStage = viewMode === 'stage' || viewMode === 'stage-h';
    const KEY_WIDTH = width / NOTES_COUNT;
    const KEY_HEIGHT = height / NOTES_COUNT;
    const STAGE_BEAT_HEIGHT = 60 * zoom;
    const STAGE_BEAT_WIDTH = 60 * zoom;
    const PIANO_HEIGHT = 120;
    const PIANO_LEFT = 120;
    const PIANO_TOP = height - PIANO_HEIGHT;

    // Viewport Culling limits
    let minX, maxX, minY, maxY;
    if (isStage) {
      if (viewMode === 'stage') {
        minX = 0; maxX = width;
        minY = 0; maxY = PIANO_TOP;
      } else {
        minX = PIANO_LEFT; maxX = width;
        minY = 0; maxY = height;
      }
    } else {
      minX = -BEAT_WIDTH * 2;
      maxX = clientWidth + BEAT_WIDTH * 2;
      minY = -ROW_HEIGHT * 2;
      maxY = clientHeight + ROW_HEIGHT * 2;
    }

    ctx.clearRect(0, 0, width, height);
    if (!isStage) {
      // Sleek obsidian backing for the grid
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 24, width, height - 24);
    } else {
      // Dark backdrop for stage modes
      ctx.fillStyle = '#030306';
      ctx.fillRect(0, 0, width, height);
    }

    if (!isStage) {
      const startTick = Math.max(0, Math.floor(scrollLeft / BEAT_WIDTH));
      const endTick = Math.min(totalTicks, Math.ceil((scrollLeft + clientWidth) / BEAT_WIDTH));

      // Studio grid rows
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const y = i * ROW_HEIGHT + 24;
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
        ctx.moveTo(canvasX, 24);
        ctx.lineTo(canvasX, clientHeight);
        ctx.stroke();
      }
    } else {
      if (viewMode === 'stage') {
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
      } else {
        // Stage Horizontal backdrop rows
        for (let i = 0; i < ALL_NOTES.length; i++) {
          const note = ALL_NOTES[i];
          const y = i * KEY_HEIGHT;
          const isSharp = note.name.includes('#');
          ctx.fillStyle = isSharp ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.02)';
          ctx.fillRect(PIANO_LEFT, y, width - PIANO_LEFT, KEY_HEIGHT);
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.strokeRect(PIANO_LEFT, y, width - PIANO_LEFT, KEY_HEIGHT);
        }
      }

      // Light beams shooting up/across from active keys
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const isActive = activeKeys[note.name];
        if (isActive) {
          const beamColor = typeof isActive === 'string' ? isActive : (activeLayer.color || '#ffffff');
          
          if (viewMode === 'stage') {
            const stageIndex = (ALL_NOTES.length - 1) - i;
            const x = stageIndex * KEY_WIDTH;
            const gradient = ctx.createLinearGradient(x + KEY_WIDTH / 2, PIANO_TOP, x + KEY_WIDTH / 2, 0);
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
          } else {
            // Stage Horizontal light beams
            const y = i * KEY_HEIGHT;
            const gradient = ctx.createLinearGradient(PIANO_LEFT, y + KEY_HEIGHT / 2, width, y + KEY_HEIGHT / 2);
            gradient.addColorStop(0, `${beamColor}99`);
            gradient.addColorStop(0.4, `${beamColor}3d`);
            gradient.addColorStop(1, `${beamColor}00`);
            ctx.fillStyle = gradient;
            ctx.fillRect(PIANO_LEFT, y, width - PIANO_LEFT, KEY_HEIGHT);

            // Add a beautiful neon flare splash on the left base on collision!
            const flare = ctx.createRadialGradient(PIANO_LEFT, y + KEY_HEIGHT / 2, 0, PIANO_LEFT, y + KEY_HEIGHT / 2, KEY_HEIGHT * 2.5);
            flare.addColorStop(0, '#ffffff');
            flare.addColorStop(0.3, `${beamColor}cc`);
            flare.addColorStop(1, `${beamColor}00`);
            ctx.fillStyle = flare;
            ctx.beginPath();
            ctx.arc(PIANO_LEFT, y + KEY_HEIGHT / 2, KEY_HEIGHT * 2.5, -Math.PI / 2, Math.PI / 2, false);
            ctx.fill();
          }
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

    const minVisibleTick = !isStage ? Math.max(0, Math.floor(scrollLeft / BEAT_WIDTH) - 2) : 0;
    const maxVisibleTick = !isStage ? Math.ceil((scrollLeft + clientWidth) / BEAT_WIDTH) + 2 : totalTicks;

    for (let l = 0; l < layers.length; l++) {
      const layer = layers[l];
      const isMain = layer.id === activeLayerId;
      const lNotes = layer.notes;
      const layerColor = layer.color || '#ffffff';

      for (let n = 0; n < lNotes.length; n++) {
        const note = lNotes[n];
        if (!isStage && (note.tick < minVisibleTick || note.tick > maxVisibleTick)) continue;
        let nx, ny, nw, nh;

        if (isStage) {
          if (viewMode === 'stage') {
            const stageIndex = (ALL_NOTES.length - 1) - note.index;
            nx = stageIndex * KEY_WIDTH;
            
            // Fix wrap-around visually (if note is at tick 0 and playhead is at 127)
            let distance = note.tick - realPlayhead;
            if (distance < -totalTicks / 2) distance += totalTicks;
            
            ny = PIANO_TOP - distance * STAGE_BEAT_HEIGHT;
            nw = KEY_WIDTH - 2;
            nh = STAGE_BEAT_HEIGHT - 2;
          } else {
            // Stage Horizontal layout: notes scroll right-to-left
            ny = note.index * KEY_HEIGHT;
            
            let distance = note.tick - realPlayhead;
            if (distance < -totalTicks / 2) distance += totalTicks;
            
            nx = PIANO_LEFT + distance * STAGE_BEAT_WIDTH;
            nw = STAGE_BEAT_WIDTH - 2;
            nh = KEY_HEIGHT - 1;
          }
        } else {
          nx = note.tick * BEAT_WIDTH - scrollLeft;
          ny = note.index * ROW_HEIGHT - scrollTop + 24;
          nw = BEAT_WIDTH - 4;
          nh = ROW_HEIGHT - 4;
        }

        // Culling
        if (nx + nw >= minX && nx <= maxX && ny + nh >= minY && ny <= maxY) {
          if (isStage) {
            const isStageV = viewMode === 'stage';
            const isStriking = isStageV 
              ? (ny + nh >= PIANO_TOP - 15) && (ny + nh <= PIANO_TOP + 15)
              : (nx >= PIANO_LEFT - 15) && (nx <= PIANO_LEFT + 15);
            
            // Glowing trail trailing behind the note
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            if (isStageV) {
              const trailLen = nh * 4;
              const trailGradient = ctx.createLinearGradient(nx, ny, nx, ny - trailLen);
              trailGradient.addColorStop(0, `${layerColor}4d`);
              trailGradient.addColorStop(0.5, `${layerColor}1a`);
              trailGradient.addColorStop(1, `${layerColor}00`);
              ctx.fillStyle = trailGradient;
              ctx.fillRect(nx + 1.5, ny - trailLen, nw - 2, trailLen);
            } else {
              const trailLen = nw * 4;
              const trailGradient = ctx.createLinearGradient(nx + nw, ny, nx + nw + trailLen, ny);
              trailGradient.addColorStop(0, `${layerColor}4d`);
              trailGradient.addColorStop(0.5, `${layerColor}1a`);
              trailGradient.addColorStop(1, `${layerColor}00`);
              ctx.fillStyle = trailGradient;
              ctx.fillRect(nx + nw, ny + 0.5, trailLen, nh - 1);
            }
            ctx.restore();

            // Main Glass/Translucent fill
            // Main Translucent fill
            ctx.fillStyle = layerColor;
            ctx.beginPath();
            const rad = isStageV ? Math.min(6, nw / 2 - 1) : Math.min(3, nh / 2 - 0.5);
            ctx.roundRect(nx + 1, ny + 1, nw - 1, nh - 1, rad);
            ctx.fill();

            // Crisp top bevel & border stroke
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.stroke();

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

        // Border stroke with Chromatic Aberration Refraction
        ctx.save();
        ctx.lineWidth = 1.2;
        ctx.globalCompositeOperation = 'screen';
        
        // Left boundary refraction (red-pink)
        ctx.strokeStyle = 'rgba(255, 46, 147, 0.55)';
        ctx.beginPath();
        ctx.roundRect(nx + 0.5, ny + 1, nw, nh, 5);
        ctx.stroke();

        // Right boundary refraction (cyan)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.beginPath();
        ctx.roundRect(nx + 1.5, ny + 1, nw, nh, 5);
        ctx.stroke();
        
        // Solid center border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.roundRect(nx + 1, ny + 1, nw, nh, 5);
        ctx.stroke();
        ctx.restore();
      }

      // Sparkles animation (Studio)
      const now = Date.now();
      const activeSparkles = sparklesRef.current.filter(s => now - s.startTime < 1000);
      for (let si = 0; si < activeSparkles.length; si++) {
        const s = activeSparkles[si];
        const age = (now - s.startTime) / 1000;
        const opacity = 1 - age;
        const sx = s.x - scrollLeft + Math.sin(age * 10) * 10;
        const sy = s.y - scrollTop - age * 30 + 24;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 2 * (1 - age), 0, Math.PI * 2);
        ctx.fill();
      }
      sparklesRef.current = activeSparkles;

      // Gamepad Selector Cursor (Studio)
      if (gamepadCursor) {
        const cx = gamepadCursor.tick * BEAT_WIDTH - scrollLeft;
        const cy = gamepadCursor.index * ROW_HEIGHT - scrollTop + 24;
        const cw = BEAT_WIDTH;
        const ch = ROW_HEIGHT;
        
        if (cx + cw >= minX && cx <= maxX && cy + ch >= minY && cy <= maxY) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([4, 2]); // dashed neon cursor box
          ctx.shadowBlur = 15;
          ctx.shadowColor = currentTheme.color;
          
          ctx.beginPath();
          ctx.roundRect(cx + 1, cy + 1, cw - 2, ch - 2, 4);
          ctx.stroke();
          
          // Semi-transparent overlay with theme accent color
          ctx.fillStyle = `${currentTheme.color}25`;
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Piano keys & particles (Stage)
    if (isStage) {
      const isStageV = viewMode === 'stage';
      
      // White Keys
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const isSharp = note.name.includes('#');
        const isActive = activeKeys[note.name];

        if (!isSharp) {
          const keyColor = isActive ? (typeof isActive === 'string' ? isActive : activeLayer.color) : '#ffffff';
          ctx.fillStyle = keyColor;
          ctx.beginPath();
          
          if (isStageV) {
            const stageIndex = (ALL_NOTES.length - 1) - i;
            const x = stageIndex * KEY_WIDTH;
            ctx.roundRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT, [0, 0, 6, 6]);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            if (isActive) {
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

            // Draw note name inside white key (vertical layout)
            ctx.save();
            ctx.font = 'bold 8px sans-serif';
            ctx.fillStyle = isActive ? '#000000' : 'rgba(0,0,0,0.45)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(note.name, x + KEY_WIDTH / 2, PIANO_TOP + PIANO_HEIGHT - 12);
            
            // Draw QWERTY key label if any
            const keyLabel = NOTE_TO_KEY_LABEL[note.name];
            if (keyLabel) {
              ctx.font = '900 7px sans-serif';
              ctx.fillStyle = isActive ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.22)';
              ctx.fillText(`[${keyLabel}]`, x + KEY_WIDTH / 2, PIANO_TOP + PIANO_HEIGHT - 3);
            }
            ctx.restore();
          } else {
            // Stage Horizontal white keys
            const y = i * KEY_HEIGHT;
            ctx.roundRect(0, y, PIANO_LEFT, KEY_HEIGHT, [0, 4, 4, 0]);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            
            if (isActive) {
              const keyGlow = ctx.createLinearGradient(0, y, PIANO_LEFT, y);
              keyGlow.addColorStop(0, 'rgba(255,255,255,0.8)');
              keyGlow.addColorStop(0.3, `${keyColor}80`);
              keyGlow.addColorStop(1, `${keyColor}00`);
              ctx.fillStyle = keyGlow;
              ctx.fillRect(0, y, PIANO_LEFT, KEY_HEIGHT);
            } else {
              ctx.fillStyle = 'rgba(0,0,0,0.06)';
              ctx.fillRect(PIANO_LEFT - 12, y, 12, KEY_HEIGHT);
            }

            // Draw note name inside white key (horizontal layout)
            ctx.save();
            ctx.font = 'bold 8px sans-serif';
            ctx.fillStyle = isActive ? '#000000' : 'rgba(0,0,0,0.45)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(note.name, 10, y + KEY_HEIGHT / 2);
            
            // Draw QWERTY key label if any
            const keyLabel = NOTE_TO_KEY_LABEL[note.name];
            if (keyLabel) {
              ctx.font = '900 8px sans-serif';
              ctx.fillStyle = isActive ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.25)';
              ctx.fillText(`[${keyLabel}]`, PIANO_LEFT - 25, y + KEY_HEIGHT / 2);
            }
            ctx.restore();
          }
        }
      }

      // Black Keys
      for (let i = 0; i < ALL_NOTES.length; i++) {
        const note = ALL_NOTES[i];
        const isSharp = note.name.includes('#');

        if (isSharp) {
          const isActive = activeKeys[note.name];
          const keyColor = isActive ? (typeof isActive === 'string' ? isActive : activeLayer.color) : '#111115';
          ctx.fillStyle = keyColor;
          ctx.beginPath();
          
          if (isStageV) {
            const stageIndex = (ALL_NOTES.length - 1) - i;
            const x = stageIndex * KEY_WIDTH;
            ctx.roundRect(x, PIANO_TOP, KEY_WIDTH, PIANO_HEIGHT * 0.62, [0, 0, 4, 4]);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            
            if (isActive) {
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

            // Draw note name inside black key (vertical layout)
            ctx.save();
            ctx.font = 'bold 7px sans-serif';
            ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.42)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(note.name, x + KEY_WIDTH / 2, PIANO_TOP + PIANO_HEIGHT * 0.62 - 10);
            
            // Draw QWERTY key label if any
            const keyLabel = NOTE_TO_KEY_LABEL[note.name];
            if (keyLabel) {
              ctx.font = '900 6.5px sans-serif';
              ctx.fillStyle = isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)';
              ctx.fillText(`[${keyLabel}]`, x + KEY_WIDTH / 2, PIANO_TOP + PIANO_HEIGHT * 0.62 - 2);
            }
            ctx.restore();
          } else {
            // Stage Horizontal black keys
            const y = i * KEY_HEIGHT;
            ctx.roundRect(0, y, PIANO_LEFT * 0.62, KEY_HEIGHT, [0, 3, 3, 0]);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            
            if (isActive) {
              const keyGlow = ctx.createLinearGradient(0, y, PIANO_LEFT * 0.62, y);
              keyGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
              keyGlow.addColorStop(0.4, `${keyColor}99`);
              keyGlow.addColorStop(1, `${keyColor}00`);
              ctx.fillStyle = keyGlow;
              ctx.fillRect(0, y, PIANO_LEFT * 0.62, KEY_HEIGHT);
            } else {
              ctx.fillStyle = 'rgba(255,255,255,0.08)';
              ctx.fillRect(PIANO_LEFT * 0.62 - 4, y + 1, 4, KEY_HEIGHT - 2);
            }

            // Draw note name inside black key (horizontal layout)
            ctx.save();
            ctx.font = 'bold 7px sans-serif';
            ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.42)';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(note.name, 6, y + KEY_HEIGHT / 2);
            
            // Draw QWERTY key label if any
            const keyLabel = NOTE_TO_KEY_LABEL[note.name];
            if (keyLabel) {
              ctx.font = '900 7px sans-serif';
              ctx.fillStyle = isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)';
              ctx.fillText(`[${keyLabel}]`, PIANO_LEFT * 0.62 - 20, y + KEY_HEIGHT / 2);
            }
            ctx.restore();
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
  }, [layers, activeLayerId, viewMode, zoom, BEAT_WIDTH, ROW_HEIGHT, totalTicks, activeKeys, isPlaying, currentTheme.color, gamepadCursor, drawRuler]);

  // Pointer interactions
  const handlePointerDown = (e) => {
    if (viewMode === 'stage' || viewMode === 'stage-h') return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;

    const clientY = e.clientY - rect.top;
    const RULER_H = 24;

    if (clientY < RULER_H) {
      isScrubbingRef.current = true;
      const tick = Math.floor(x / BEAT_WIDTH);
      if (tick >= 0 && tick < totalTicks) {
        scrubPlayhead?.(tick);
      }
      return;
    }

    const y = clientY - RULER_H + container.scrollTop;
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
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;

    if (isScrubbingRef.current) {
      const tick = Math.floor(x / BEAT_WIDTH);
      if (tick >= 0 && tick < totalTicks) {
        scrubPlayhead?.(tick);
      }
      return;
    }

    if (!isDrawingRef.current && !isErasingRef.current) return;

    const clientY = e.clientY - rect.top;
    const RULER_H = 24;
    if (clientY < RULER_H) return;

    const y = clientY - RULER_H + container.scrollTop;
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
    isScrubbingRef.current = false;
    lastDrawnNoteRef.current = null;
  };

  // Global pointerup listener to prevent stuck drawing/scrubbing states if released outside grid
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      isDrawingRef.current = false;
      isErasingRef.current = false;
      isScrubbingRef.current = false;
      lastDrawnNoteRef.current = null;
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  // Ruler wheel scrubbing
  const handleRulerWheel = (e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;
    const direction = delta > 0 ? 1 : -1;
    const currentTick = playheadPositionRef.current;
    const nextTick = (currentTick + direction + totalTicks) % totalTicks;
    scrubPlayhead?.(nextTick);
  };

  // Scroll sync
  const handleScroll = () => {
    if (viewMode === 'studio') {
      if (pianoKeysRef.current && scrollContainerRef.current) {
        pianoKeysRef.current.scrollTop = scrollContainerRef.current.scrollTop;
      }
      drawGrid();
      drawRuler();
    }
  };

  // Redraw loops
  useEffect(() => {
    drawGrid();
    drawRuler();
    const handleResize = () => {
      drawGrid();
      drawRuler();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawGrid, drawRuler]);

  useEffect(() => {
    if (viewMode === 'stage' || viewMode === 'stage-h' || isPlaying) {
      let animationFrame;
      const render = () => {
        drawGrid();
        if (viewMode === 'studio') {
          drawRuler();
          const currentTick = playheadPositionRef.current;
          const px = currentTick * BEAT_WIDTH;
          const shadeEl = document.getElementById('studio-playhead-shade');
          const lineEl = document.getElementById('studio-playhead-line');
          if (shadeEl) shadeEl.style.width = `${px}px`;
          if (lineEl) lineEl.style.left = `${px}px`;
        }
        animationFrame = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationFrame);
    } else {
      drawGrid();
      if (viewMode === 'studio') drawRuler();
      if (sparklesRef.current.length > 0) {
        let animationFrame;
        const render = () => {
          drawGrid();
          if (viewMode === 'studio') drawRuler();
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
  }, [drawGrid, drawRuler, viewMode, isPlaying, BEAT_WIDTH]);

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
          height: `${viewMode === 'studio' ? ALL_NOTES.length * ROW_HEIGHT + 24 : ALL_NOTES.length * ROW_HEIGHT}px` 
        }} 
        className="absolute top-0 left-0 pointer-events-none"
      />
      <div className="sticky top-0 left-0 z-0 h-0 w-full overflow-visible pointer-events-none">
        <canvas ref={canvasRef} className="absolute top-0 left-0 block cursor-crosshair pointer-events-auto" />
        {viewMode === 'studio' && (
          <canvas 
            ref={rulerCanvasRef} 
            className="absolute top-0 left-0 block z-20 cursor-ew-resize border-b border-white/[0.08] pointer-events-auto" 
            style={{ height: '24px' }} 
            onWheel={handleRulerWheel}
          />
        )}
      </div>

      {viewMode === 'studio' && (
        <>
          <div 
            id="studio-playhead-shade"
            className="absolute pointer-events-none z-10 opacity-50"
            style={{
              top: '24px',
              height: `${ALL_NOTES.length * ROW_HEIGHT}px`,
              background: 'linear-gradient(90deg, rgba(255, 42, 75, 0.04) 0%, rgba(255, 42, 75, 0) 100%)',
              left: 0
            }}
          />
          <div 
            id="studio-playhead-line"
            className="absolute w-[1px] bg-[#ff2a4b] pointer-events-none z-30"
            style={{
              top: '0px',
              height: `${ALL_NOTES.length * ROW_HEIGHT + 24}px`
            }}
          >
            {/* Physically attached Red Ruler Triangle Pointer (100% Inseparable) */}
            <div 
              className="absolute top-0 -translate-x-[5.5px] left-0 w-0 h-0"
              style={{
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '10px solid #ff2a4b'
              }}
            />
          </div>
        </>
      )}
    </div>
  );
});

SequencerCanvas.displayName = 'SequencerCanvas';

export default SequencerCanvas;
