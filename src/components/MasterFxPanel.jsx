import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const FxSlider = ({ label, value, onChange, color, min = 0, max = 1, step = 0.1, unit = '%', displayValue }) => {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-[11px] font-black text-white/90 tabular-nums leading-none">
          {displayValue || (unit === '%' ? `${(value * 100).toFixed(0)}%` : `${value > 0 ? '+' : ''}${value}dB`)}
        </span>
      </div>
      <div className="relative flex items-center h-8 select-none group">
        {/* Custom Track Background */}
        <div className="absolute left-0 right-0 h-2 rounded-full bg-black/60 border border-white/5 overflow-hidden">
          {/* Custom Track Active Fill */}
          <div 
            className="h-full rounded-full transition-all duration-75"
            style={{ 
              width: `${percent}%`, 
              background: color,
              boxShadow: `0 0 10px ${color}`
            }}
          />
        </div>
        {/* Custom Thumb: Tactile silver/gray audio console cap */}
        <div 
          className="absolute w-5.5 h-5.5 rounded-full bg-gradient-to-b from-[#f8fafc] via-[#cbd5e1] to-[#64748b] shadow-[0_3px_8px_rgba(0,0,0,0.6)] border border-slate-400/80 group-hover:scale-110 active:scale-95 transition-transform duration-100 pointer-events-none flex items-center justify-center"
          style={{ 
            left: `calc(${percent}% - 11px)` 
          }}
        >
          {/* Inner cap ring details */}
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-t from-[#94a3b8] to-[#cbd5e1] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          </div>
        </div>
        {/* Invisible Range Slider for Native Drag Behavior */}
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>
    </div>
  );
};

export default function MasterFxPanel({
  analyserRef,
  eqLowLevel,
  setEqLowLevel,
  eqMidLevel,
  setEqMidLevel,
  eqHighLevel,
  setEqHighLevel,
  reverbLevel,
  setReverbLevel,
  delayLevel,
  setDelayLevel,
  distortionLevel,
  setDistortionLevel,
  chorusLevel,
  setChorusLevel,
  phaserLevel,
  setPhaserLevel,
  currentTheme,
  closePanel
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set internal resolution matching client container size for crisp visualizer rendering
    canvas.width = canvas.clientWidth || 364;
    canvas.height = canvas.clientHeight || 80;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      // Clean trace effect
      ctx.fillStyle = 'rgba(7, 7, 10, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const activeColor = currentTheme.color;

      if (!analyserRef || !analyserRef.current) {
        // Idle wave
        ctx.strokeStyle = `${activeColor}40`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const time = Date.now() * 0.003;
        for (let i = 0; i < width; i++) {
          const y = height / 2 + Math.sin(i * 0.04 + time) * 6 * Math.cos(i * 0.02 + time);
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
        return;
      }

      let data;
      try {
        data = analyserRef.current.getValue();
      } catch {
        return;
      }

      // Bass detection for center glow
      let bassSum = 0;
      for (let i = 0; i < 4; i++) {
        bassSum += Math.max(0, ((data[i] || -100) + 100) / 100);
      }
      const bassVal = bassSum / 4;

      // Ambient center glow
      ctx.fillStyle = `${activeColor}15`;
      ctx.shadowBlur = 24 * bassVal;
      ctx.shadowColor = activeColor;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 8 + bassVal * 20, 0, Math.PI * 2);
      ctx.fill();

      // FFT spectrum as a beautiful filled glow wave
      ctx.shadowBlur = 12;
      ctx.shadowColor = activeColor;
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;

      const barWidth = (width / 32);
      ctx.beginPath();
      for (let i = 0; i < 32; i++) {
        const db = data[i] || -100;
        const norm = Math.max(0, (db + 100) / 100);
        const barHeight = norm * height * 0.75;
        const x = i * barWidth;
        const y = height - barHeight - 4;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Create a gradient for fill
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, `${activeColor}30`);
      grad.addColorStop(1, `${activeColor}01`);
      ctx.fillStyle = grad;
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyserRef, currentTheme]);

  return (
    <motion.div 
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute right-5 top-5 bottom-5 w-[420px] z-50 flex flex-col rounded-[28px] overflow-hidden border"
      style={{
        background: 'rgba(15, 15, 25, 0.65)',
        backdropFilter: 'blur(35px) saturate(220%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: `0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 0 rgba(255,255,255,0.15), inset -2px 0 8px rgba(0,240,255,0.12), inset 2px 0 8px rgba(255,46,147,0.12), 0 0 40px -10px ${currentTheme.color}20`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-9 pt-8 pb-4">
        <div>
          <h3 className="text-[14px] font-black uppercase tracking-[0.15em]" style={{ textShadow: `0 0 10px ${currentTheme.color}50` }}>
            MASTER <span style={{ color: currentTheme.color }}>FX</span>
          </h3>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">DSP Processing</span>
        </div>
        <button 
          onClick={closePanel} 
          className="w-8 h-8 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer border border-white/5 hover:border-white/15 active:scale-90"
        >
          <X className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-9 pb-8 flex flex-col gap-6">
        
        {/* Spectrum Analyzer */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Spectrum</span>
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 px-2 py-0.5 rounded-md">LIVE</span>
          </div>
          <div className="w-full h-20 rounded-2xl bg-black/50 border border-white/[0.06] overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" width={280} height={80} />
          </div>
        </div>

        {/* 3-Band EQ */}
        <div className="pt-4 border-t border-white/[0.08]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Equalizer</span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/15 px-2 py-0.5 rounded-md">EQ3</span>
          </div>
          <div className="flex flex-col gap-4">
            <FxSlider label="Bass" value={eqLowLevel} onChange={setEqLowLevel} color="#ef4444" min={-24} max={12} step={10} unit="dB" displayValue={`${eqLowLevel > 0 ? '+' : ''}${eqLowLevel}dB`} />
            <FxSlider label="Mid" value={eqMidLevel} onChange={setEqMidLevel} color="#f59e0b" min={-24} max={12} step={10} unit="dB" displayValue={`${eqMidLevel > 0 ? '+' : ''}${eqMidLevel}dB`} />
            <FxSlider label="High" value={eqHighLevel} onChange={setEqHighLevel} color="#10b981" min={-24} max={12} step={10} unit="dB" displayValue={`${eqHighLevel > 0 ? '+' : ''}${eqHighLevel}dB`} />
          </div>
        </div>

        {/* Effects */}
        <div className="pt-4 border-t border-white/[0.08]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">Effects</span>
          <div className="flex flex-col gap-4">
            <FxSlider label="Reverb" value={reverbLevel} onChange={setReverbLevel} color="#a78bfa" />
            <FxSlider label="Echo" value={delayLevel} onChange={setDelayLevel} color="#60a5fa" />
            <FxSlider label="Grit" value={distortionLevel} onChange={setDistortionLevel} color="#f43f5e" />
            <FxSlider label="Chorus" value={chorusLevel} onChange={setChorusLevel} color="#3b82f6" />
            <FxSlider label="Phaser" value={phaserLevel} onChange={setPhaserLevel} color="#10b981" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
