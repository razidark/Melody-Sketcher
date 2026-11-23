import { useState, useRef, useEffect } from 'react';

import { 
  Play, 
  Square, 
  Radio, 
  Volume2, 
  Trash2, 
  Sliders,
  Timer,
  Disc3,
  Rewind,
  FastForward,
  Repeat
} from 'lucide-react';

const RHYTHM_MODES = ['off', 'auto', 'four-floor', 'boom-bap', 'ballad'];
const RHYTHM_LABELS = { 
  off: 'RHYTHM', 
  auto: 'AUTO', 
  'four-floor': '4-FLOOR', 
  'boom-bap': 'BOOM-BAP', 
  ballad: 'BALLAD' 
};

export default function TransportBar({
  isPlaying,
  isLooping,
  setIsLooping,
  togglePlay,
  seekSeconds,
  isRecording,
  setIsRecording,
  playheadPosition,
  currentTheme,
  masterVolume,
  setMasterVolume,
  bpm,
  setBpm,
  clearSketch,
  rhythmMode,
  setRhythmMode,
  isMixerOpen,
  setIsMixerOpen,
  viewMode,
  setViewMode,
  metronome,
  setMetronome,
  analyserRef
}) {
  const [localBpm, setLocalBpm] = useState(bpm);
  const [prevBpm, setPrevBpm] = useState(bpm);
  if (prevBpm !== bpm) {
    setPrevBpm(bpm);
    setLocalBpm(bpm);
  }

  const currentBar = Math.floor(playheadPosition / 16) + 1;
  const currentBeat = Math.floor((playheadPosition % 16) / 4) + 1;

  const visualizerCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set stable internal resolution
    canvas.width = 72; 
    canvas.height = 32;

    let animationId;
    const peaks = new Array(10).fill(0);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const barCount = 10;
      const barWidth = 5;
      const spacing = 2;

      let data = null;
      if (analyserRef && analyserRef.current) {
        try {
          data = analyserRef.current.getValue();
        } catch {
          // ignore
        }
      }

      for (let i = 0; i < barCount; i++) {
        let heightNorm = 0.08;

        if (data && isPlaying) {
          const bin = Math.min(data.length - 1, Math.floor((i / barCount) * 16));
          const db = data[bin] || -100;
          heightNorm = Math.max(0.12, (db + 100) / 100);
        } else if (isPlaying) {
          // Idle wave animation
          heightNorm = 0.22 + Math.sin(Date.now() * 0.008 + i * 0.5) * 0.14;
        }

        const barHeight = heightNorm * canvas.height;
        const x = i * (barWidth + spacing);
        const y = canvas.height - barHeight;

        // Peak decay calculation
        if (barHeight > peaks[i]) {
          peaks[i] = barHeight;
        } else {
          peaks[i] = Math.max(0, peaks[i] - 0.45);
        }

        // Equalizer Bar Glow Shadow
        ctx.shadowColor = currentTheme.color;
        ctx.shadowBlur = 4;

        // Visualizer gradient
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, `${currentTheme.color}33`);
        grad.addColorStop(0.6, currentTheme.color);
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;

        // Rounded equalizer bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();

        // Reset shadow for peaks
        ctx.shadowBlur = 0;

        // Draw falling peak dot
        if (peaks[i] > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, canvas.height - peaks[i] - 1.5, barWidth, 1.5);
        }
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserRef, isPlaying, currentTheme]);

  // Calculations for custom styled sliders
  const volPercent = ((masterVolume - -60) / 70) * 100;
  const bpmPercent = ((bpm - 40) / 240) * 100;

  return (
    <footer className="h-20 bg-black/45 backdrop-blur-3xl border-t border-white/[0.06] flex items-center justify-center px-4 z-50 shrink-0 relative shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
      {/* Bottom accent neon line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #ff3366, #ff9f43, #2ebd59, #00f0ff, #0066ff, #ff3366)',
          backgroundSize: '300% 300%',
          animation: 'rainbowBorder 8s linear infinite',
          boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)'
        }}
      />
      <div className="w-full px-6 grid grid-cols-[1.25fr_auto_1.25fr] items-center gap-6 transport-inner">
        {/* LEFT: View + Mixer + Rhythm */}
        <div className="flex items-center gap-4 justify-self-start transport-left">
        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/90 rounded-md p-1.5 border border-white/10 shadow-md">
          {['studio', 'stage', 'stage-h'].map(mode => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2.5 rounded-md text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 cursor-pointer active:scale-95
                ${viewMode === mode 
                  ? 'bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.15)] scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'}`}
            >
              {mode === 'stage-h' ? 'STAGE (H)' : mode === 'stage' ? 'STAGE (V)' : 'STUDIO'}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsMixerOpen(!isMixerOpen)}
          className={`flex items-center gap-2 px-5 py-3 rounded-md transition-all text-[11px] font-black uppercase tracking-[0.15em] cursor-pointer hover:scale-[1.02] active:scale-95
            ${isMixerOpen 
              ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white'}`}
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">MIXER</span>
        </button>

        {/* Rhythm Mode */}
        <button 
          onClick={() => {
            const idx = RHYTHM_MODES.indexOf(rhythmMode);
            setRhythmMode(RHYTHM_MODES[(idx + 1) % RHYTHM_MODES.length]);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-md transition-all text-[11px] font-black uppercase tracking-[0.15em] cursor-pointer hover:scale-[1.02] active:scale-95
            ${rhythmMode !== 'off' 
              ? 'bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
              : 'bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white'}`}
        >
          <Disc3 className={`w-4 h-4 ${rhythmMode !== 'off' ? 'animate-spin' : ''}`} style={rhythmMode !== 'off' ? { animationDuration: '3s' } : {}} />
          {RHYTHM_LABELS[rhythmMode]}
        </button>
      </div>

      {/* CENTER: Transport */}
      <div className="flex items-center gap-4 justify-self-center bg-slate-900/90 px-6 py-2.5 rounded-md border border-white/10 shadow-lg">
        {/* Metronome */}
        <button
          onClick={() => setMetronome(!metronome)}
          className={`w-12 h-12 rounded-md flex items-center justify-center transition-all cursor-pointer hover:scale-[1.02] active:scale-95 border
            ${metronome
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'}`}
          title="Metronome"
        >
          <Timer className="w-5 h-5" />
        </button>

        {/* Record */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 border cursor-pointer hover:scale-[1.05] active:scale-95
            ${isRecording
              ? 'bg-red-600 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] text-white'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:border-red-400/40'}`}
          title="Record"
        >
          <Radio className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
        </button>

        {/* Seek -10s */}
        <button
          onClick={() => seekSeconds && seekSeconds(-10)}
          className="w-11 h-11 rounded-md flex items-center justify-center transition-all cursor-pointer hover:scale-[1.05] active:scale-95 bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          title="Rewind 10 Seconds"
        >
          <Rewind className="w-4 h-4 fill-current" />
        </button>

        {/* Play/Stop */}
        <button 
          onClick={togglePlay}
          className={`relative w-14 h-14 rounded-md flex items-center justify-center transition-all duration-300 group cursor-pointer border-2 hover:scale-[1.05] active:scale-95
            ${isPlaying 
              ? 'border-transparent' 
              : 'border-white/20 hover:border-transparent'}`}
          style={{
            background: isPlaying 
              ? `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.secondary || '#f472b6'})` 
              : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
            boxShadow: isPlaying 
              ? `0 0 30px ${currentTheme.color}80` 
              : '0 6px 20px rgba(0,0,0,0.5)'
          }}
        >
          {isPlaying 
            ? <Square className="w-6 h-6 fill-white text-white drop-shadow-md" /> 
            : <Play className="w-7 h-7 fill-black text-black ml-1.5 drop-shadow-md" />}
        </button>

        {/* Seek +10s */}
        <button
          onClick={() => seekSeconds && seekSeconds(10)}
          className="w-11 h-11 rounded-md flex items-center justify-center transition-all cursor-pointer hover:scale-[1.05] active:scale-95 bg-white/5 border border-white/10 text-slate-400 hover:text-white"
          title="Forward 10 Seconds"
        >
          <FastForward className="w-4 h-4 fill-current" />
        </button>

        {/* Repeat/Loop */}
        <button
          onClick={() => setIsLooping && setIsLooping(!isLooping)}
          className={`w-11 h-11 rounded-md flex items-center justify-center transition-all cursor-pointer hover:scale-[1.05] active:scale-95 border
            ${isLooping
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'}`}
          title={isLooping ? 'Repeat: ON (Loop timeline)' : 'Repeat: OFF (Play once)'}
        >
          <Repeat className="w-4 h-4" />
        </button>

        {/* Position + Progress + Mini Visualizer */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center gap-1.5 w-48 select-none">
            {/* Time position */}
            <div className="flex items-center gap-2 text-[13px] tabular-nums font-bold">
              <span className="text-slate-400 text-[10px] tracking-widest uppercase">BAR</span>
              <span className="text-white w-6 text-right">{currentBar}</span>
              <span className="text-slate-500">.</span>
              <span className="text-slate-300 w-4">{currentBeat}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <div
                id="timeline-progress-bar"
                className="h-full rounded-full transition-none"
                style={{ 
                  background: 'linear-gradient(90deg, #ff3366, #ff9f43, #2ebd59, #00f0ff, #0066ff)',
                  boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                }}
              />
            </div>
          </div>

          {/* Dynamic Spectrum Equalizer Visualizer */}
          <div className="flex items-center justify-center bg-black/40 rounded-xl px-2.5 py-1.5 border border-white/[0.08] w-[88px] h-11 shadow-inner">
            <canvas ref={visualizerCanvasRef} className="w-[72px] h-[28px] opacity-90" />
          </div>
        </div>
      </div>

      {/* RIGHT: Volume, BPM, Clear */}
      <div className="flex items-center gap-5 justify-self-end transport-right">
        {/* Master Volume */}
        <div className="flex items-center gap-3 glass-gloss rounded-2xl pl-4 pr-3 py-2 shadow-md relative">
          <Volume2 className="w-4 h-4 text-slate-400" />
          
          {/* Custom Slider Layout */}
          <div className="relative flex items-center h-5 w-20 select-none group">
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${volPercent}%`,
                  background: `linear-gradient(90deg, #6366f1, ${currentTheme.color})`,
                  boxShadow: `0 0 10px ${currentTheme.color}a0`
                }}
              />
            </div>
            <div 
              className="absolute w-3 h-3 rounded-full bg-white border border-white/40 group-hover:scale-125 transition-transform duration-200 pointer-events-none"
              style={{ left: `calc(${volPercent}% - 6px)` }}
            />
            <input 
              type="range" min="-60" max="10" step="10" 
              value={masterVolume} 
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={`Master: ${masterVolume} dB`}
            />
          </div>

          <div className="relative flex items-center bg-black/40 rounded px-1.5 py-0.5 border border-white/10 hover:border-white/30 transition-colors">
            <input 
              type="number" 
              value={masterVolume > -60 ? masterVolume : -60}
              min="-60" max="10"
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              onBlur={(e) => {
                let val = Number(e.target.value);
                if (val < -60) val = -60;
                if (val > 10) val = 10;
                setMasterVolume(val);
              }}
              className="w-8 bg-transparent text-right text-[11px] font-bold text-slate-200 focus:outline-none focus:text-white tabular-nums no-spinners"
            />
            <span className="text-[9px] text-slate-500 ml-0.5 pointer-events-none font-bold">dB</span>
          </div>
        </div>

        <div className="w-px h-10 bg-white/[0.08]" />

        {/* BPM */}
        <div className="flex items-center gap-3 glass-gloss rounded-2xl pl-4 pr-3 py-2 shadow-md">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5 select-none">BPM</span>
            <input 
              type="number"
              min="40" max="280"
              value={localBpm}
              onChange={(e) => {
                const val = e.target.value;
                setLocalBpm(val);
                const num = Number(val);
                if (!isNaN(num) && num >= 40 && num <= 280) {
                  setBpm(num);
                }
              }}
              onBlur={() => {
                let num = Number(localBpm);
                if (isNaN(num) || num < 40) num = 40;
                if (num > 280) num = 280;
                setLocalBpm(num);
                setBpm(num);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="w-10 bg-black/40 border border-white/10 hover:border-white/30 transition-colors rounded text-center text-[14px] font-black text-white focus:outline-none tabular-nums no-spinners leading-tight"
            />
          </div>

          {/* Custom BPM Slider Layout */}
          <div className="relative flex items-center h-5 w-24 select-none group">
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${bpmPercent}%`,
                  background: `linear-gradient(90deg, #ec4899, ${currentTheme.color})`,
                  boxShadow: `0 0 10px ${currentTheme.color}a0`
                }}
              />
            </div>
            <div 
              className="absolute w-3 h-3 rounded-full bg-white border border-white/40 group-hover:scale-125 transition-transform duration-200 pointer-events-none"
              style={{ left: `calc(${bpmPercent}% - 6px)` }}
            />
            <input 
              type="range" min="40" max="280" step="10" 
              value={bpm} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setLocalBpm(val);
                setBpm(val);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="w-px h-10 bg-white/[0.08]" />

        {/* Clear */}
        <button 
          onClick={clearSketch}
          className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-all text-[11px] font-black uppercase tracking-widest group cursor-pointer px-4 py-2.5 rounded-2xl glass-gloss hover:scale-[1.02] active:scale-95"
        >
          <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          <span className="hidden sm:inline">CLEAR</span>
        </button>
      </div>
      </div>
    </footer>
  );
}
