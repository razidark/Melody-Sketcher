import { motion } from 'framer-motion';
import { 
  Music, 
  Sliders, 
  Settings2, 
  Tv, 
  Keyboard, 
  Play, 
  X,
  MousePointer
} from 'lucide-react';
import { getThemeBg } from '../constants/midiConstants';

export default function IntroOverlay({
  launchStudio,
  currentTheme,
  hasSavedWorkspace,
  restoreLastSession
}) {
  const features = [
    {
      icon: <Music className="w-6 h-6" />,
      title: "Multi-Track Sequencer",
      desc: "Paint complex melodies across unlimited layers, each with unique colors, instruments, and real-time canvas editing.",
      accent: '#ff2e93'
    },
    {
      icon: <Sliders className="w-6 h-6" />,
      title: "SSL-Style Mixer Console",
      desc: "Per-channel volume faders, stereo panning, mute/solo — all in a professional hardware-emulated console.",
      accent: '#00f0ff'
    },
    {
      icon: <Settings2 className="w-6 h-6" />,
      title: "Stereo DSP FX Rack",
      desc: "Chain Reverb, Stereo Delay, Chorus, Phaser, Distortion, and a 3-band Parametric EQ on the master bus.",
      accent: '#f472b6'
    },
    {
      icon: <Tv className="w-6 h-6" />,
      title: "Performance Stage",
      desc: "Switch to Stage Mode for a cinematic falling-note layout with glowing light beams and particle effects.",
      accent: '#60a5fa'
    }
  ];

  const shortcuts = [
    { keys: ["Space"], label: "Play / Stop" },
    { keys: ["Q", "M", "X"], label: "Panels Toggle" },
    { keys: ["Arrows"], label: "Playhead / BPM" },
    { keys: ["Digit 1–9"], label: "Select Tracks" },
    { keys: ["A–Quote"], label: "Play Notes" }
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring", stiffness: 120, damping: 18 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 select-none"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(10,8,22,0.96) 0%, rgba(2,2,3,0.99) 80%)' }}
    >
      {/* Animated ambient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ backgroundColor: currentTheme.color }}
      />
      <motion.div 
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: currentTheme.secondary || '#4f46e5' }}
      />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px'
      }} />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl w-full rounded-[32px] overflow-y-auto max-h-[92vh] scrollbar-studio border"
        style={{
          background: 'rgba(15, 15, 25, 0.65)',
          backdropFilter: 'blur(30px) saturate(240%)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: `0 60px 120px -20px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.15), inset -2px 0 8px rgba(0,240,255,0.15), inset 2px 0 8px rgba(255,46,147,0.15), 0 0 80px -20px ${currentTheme.color}30`
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-8 right-8 h-px" style={{ background: getThemeBg(currentTheme), opacity: 0.5 }} />
        
        <div className="p-8 md:p-14 flex flex-col gap-10">
          {/* Close button */}
          <motion.button 
            variants={item}
            onClick={launchStudio}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 flex items-center justify-center transition-all cursor-pointer group z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </motion.button>

          {/* Hero branding */}
          <motion.div variants={item} className="text-center flex flex-col items-center gap-4 pt-2">
            {/* Custom Glowing Emblem */}
            <motion.div 
              className="w-24 h-24 rounded-[28px] flex items-center justify-center transition-all duration-300 relative overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/15 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
              }}
              whileHover={{ scale: 1.08, rotate: 3 }}
            >
              {/* Blur glow */}
              <div 
                className="absolute inset-1 rounded-[24px] opacity-40 blur-[4px]"
                style={{ background: getThemeBg(currentTheme) }}
              />
              
              {/* Theme gradient */}
              <div 
                className="absolute inset-1.5 rounded-[22px] opacity-95"
                style={{ background: getThemeBg(currentTheme) }}
              />
              
              {/* Sheen reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
              
              <Music className="w-12 h-12 text-white relative z-10 drop-shadow-lg" />
            </motion.div>
            
            <div className="mt-4">
              <h1 className="text-4xl md:text-5.5xl font-black tracking-[0.35em] uppercase leading-none select-none">
                <span className="text-white">MELODY</span>{' '}
                <span style={{ 
                  color: currentTheme.color, 
                  textShadow: `0 0 24px ${currentTheme.color}90` 
                }}>SKETCHER</span>
              </h1>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-white/15" />
                <span className="text-[12px] font-black text-indigo-400 tracking-[0.4em] uppercase">
                  Studio Workstation
                </span>
                <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-white/15" />
              </div>
            </div>
            
            <p className="text-slate-300 text-sm md:text-base max-w-xl mt-3 font-medium leading-relaxed">
              An interactive web workstation for sketching melodies, composing with procedural drum patterns, mixing multi-track audio, and exporting CD-quality WAV files.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                variants={item}
                whileHover={{ 
                  y: -3, 
                  borderColor: `${feat.accent}40`,
                  boxShadow: `0 12px 30px -10px ${feat.accent}35, inset 0 1px 0 0 rgba(255,255,255,0.1)` 
                }}
                className="rounded-2xl p-6 flex gap-5 transition-all duration-300 group cursor-default"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm"
                  style={{ backgroundColor: `${feat.accent}15`, color: feat.accent }}
                >
                  {feat.icon}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <h3 className="text-[15px] font-bold text-slate-100 tracking-wide">{feat.title}</h3>
                  <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls reference */}
          <motion.div 
            variants={item} 
            className="rounded-2xl p-6 flex flex-col sm:flex-row gap-8"
            style={{ 
              background: 'rgba(6, 6, 10, 0.45)', 
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex-1 flex flex-col gap-4">
              <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <MousePointer className="w-4 h-4" /> Mouse Controls
              </h4>
              <div className="flex flex-col gap-3 text-[13px] text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded font-bold text-slate-200 shadow-sm">Left Click</span>
                  <span>Paint notes on the grid</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded font-bold text-slate-200 shadow-sm">Right Click</span>
                  <span>Erase notes</span>
                </div>
              </div>
            </div>
            
            <div className="w-px bg-white/10 self-stretch hidden sm:block" />
            
            <div className="flex-1 flex flex-col gap-4">
              <h4 className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
              </h4>
              <div className="flex flex-wrap gap-2">
                {shortcuts.map((sc, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl px-3 py-1.5 text-[12px] shadow-sm">
                    <div className="flex gap-1">
                      {sc.keys.map((k, kidx) => (
                        <kbd key={kidx} className="bg-white/15 px-2 py-0.5 rounded text-[11px] font-mono text-white font-bold shadow-inner">
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <span className="text-slate-400 font-medium ml-1">{sc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={item} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 pb-2">
            {hasSavedWorkspace && (
              <motion.button
                onClick={restoreLastSession}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative group flex items-center gap-3 px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm cursor-pointer overflow-hidden border border-white/20 transition-all duration-300"
                style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.05)'
                }}
              >
                <span className="text-slate-200 group-hover:text-white transition-colors">Restore Session</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={launchStudio}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative group flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm cursor-pointer overflow-hidden isolate transition-all duration-300"
              style={{ 
                background: getThemeBg(currentTheme),
                boxShadow: `0 20px 48px -6px ${currentTheme.color}80, inset 0 1px 0 0 rgba(255,255,255,0.3), 0 0 0 1px rgba(255,255,255,0.1)`
              }}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-all duration-300" />
              <Play className="w-5 h-5 text-white fill-white drop-shadow-sm relative z-10" /> 
              <span className="text-white drop-shadow-sm relative z-10">
                {hasSavedWorkspace ? 'Start Fresh' : 'Launch Studio'}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
