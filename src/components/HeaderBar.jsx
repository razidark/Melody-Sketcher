import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Minus,
  Plus,
  Upload,
  Download,
  ChevronDown,
  Settings2,
  HelpCircle,
  Sliders,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import {
  getThemeBg
} from '../constants/midiConstants';

export default function HeaderBar({
  currentTheme,
  barCount,
  setBarCount,
  zoom,
  setZoom,
  fileInputRef,
  exportMidi,
  exportWav,
  exportStems,
  currentInstrument,
  isInstrumentMenuOpen,
  setIsInstrumentMenuOpen,
  isFxOpen,
  setIsFxOpen,
  openIntro,
  isDashboardOpen,
  setIsDashboardOpen,
  openGuide,
  openManual
}) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  const [time, setTime] = useState(new Date());
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  const formattedDate = time.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  }).toUpperCase();

  return (
    <header className="h-16 bg-black/45 backdrop-blur-3xl border-b border-white/[0.06] flex items-center justify-center px-4 z-50 shrink-0 relative gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top accent neon line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #ff3366, #ff9f43, #2ebd59, #00f0ff, #0066ff, #ff3366)',
          backgroundSize: '300% 300%',
          animation: 'rainbowBorder 8s linear infinite',
          boxShadow: '0 0 14px rgba(0, 240, 255, 0.4)'
        }}
      />

      <div className="w-full px-6 flex items-center justify-between gap-6 header-inner">
        {/* LEFT: Logo + Controls */}
        <div className="flex items-center gap-6">
        {/* Redesigned Logo Emblem */}
        <div className="flex items-center gap-4 cursor-pointer group mr-3 select-none" onClick={openIntro}>
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 active:scale-95 relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.08)] border border-white/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.03))',
            }}
          >
            {/* Glow behind the icon matching current theme */}
            <div 
              className="absolute inset-0.5 rounded-[14px] opacity-40 blur-[4px] transition-all duration-500 group-hover:opacity-60"
              style={{ background: getThemeBg(currentTheme) }}
            />
            
            {/* Theme color gradient background */}
            <div 
              className="absolute inset-1 rounded-[12px] opacity-90 transition-all duration-500 group-hover:rotate-12"
              style={{ background: getThemeBg(currentTheme) }}
            />
            
            {/* Glass diagonal glossy sheen reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
            
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white relative z-10 drop-shadow-md group-hover:rotate-12 transition-transform duration-300" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="currentColor" />
              <circle cx="18" cy="16" r="3" fill="currentColor" />
              <path d="M3 10c1-1 3-1 4 0" opacity="0.7" strokeWidth="1.5" />
              <path d="M14 6c1-1 3-1 4 0" opacity="0.7" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-[16px] font-black tracking-[0.25em] uppercase leading-none text-white drop-shadow-md">
              MELODY <span className="bg-gradient-to-r from-[#ff3366] via-[#ff9f43] to-[#00f0ff] bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(0,240,255,0.3)] font-black">SKETCHER</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">STUDIO</span>
              <span className="text-[7px] font-extrabold text-white/80 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/5 shadow-sm leading-none">PRO</span>
            </div>
          </div>
        </div>

        <div className="w-px h-10 bg-white/[0.08]" />

        {/* Bar Length */}
        <div className="flex items-center gap-2 bg-slate-900/80 rounded-md px-3 py-2 border border-white/10 shadow-md">
          <button
            onClick={() => setBarCount(Math.max(1, barCount - 1))}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90 bg-white/5"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="px-3 py-0.5 text-center select-none min-w-[65px]">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">BARS</span>
            <span className="text-[14px] font-black text-white tabular-nums block mt-1">{barCount}</span>
          </div>
          <button
            onClick={() => setBarCount(barCount + 1)}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90 bg-white/5"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2 bg-slate-900/80 rounded-md px-3 py-2 border border-white/10 shadow-md">
          <button
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90 bg-white/5"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="group flex flex-col items-center justify-center px-3 py-0.5 select-none min-w-[65px] cursor-pointer hover:bg-white/10 rounded-md transition-all active:scale-95 bg-white/5"
            title="Reset Zoom"
          >
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none group-hover:text-white transition-colors">ZOOM</span>
              <RotateCcw className="w-2.5 h-2.5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[14px] font-black text-white tabular-nums block mt-1">{Math.round(zoom * 100)}%</span>
          </button>
          <button
            onClick={() => setZoom(Math.min(4, zoom + 0.1))}
            className="w-9 h-9 rounded-md hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90 bg-white/5"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
            className="flex items-center justify-between gap-3 px-6 py-3 rounded-md bg-indigo-600/20 border border-indigo-400/40 hover:bg-indigo-600/35 transition-all text-[12px] font-black uppercase tracking-wider text-white cursor-pointer hover:scale-[1.02] active:scale-95 shadow-[0_4px_16px_rgba(99,102,241,0.25)]"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4.5 h-4.5 text-indigo-400" />
              <span>FILE</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-indigo-300 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isFileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 rounded-md p-2.5 z-50 w-60 bg-[#090a10]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
              >
                <button
                  onClick={() => { fileInputRef.current.click(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-md hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider text-slate-100 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-slate-400" /> Import MIDI (.mid)
                </button>
                <button
                  onClick={() => { exportMidi(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-md hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider text-slate-100 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-400" /> Export MIDI (.mid)
                </button>
                <div className="h-px bg-white/10 my-1.5 mx-2" />
                <button
                  onClick={() => { exportWav(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-md hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider text-indigo-300 cursor-pointer"
                >
                  <Music className="w-4 h-4 text-indigo-400" /> Render Master WAV
                </button>
                {exportStems && (
                  <button
                    onClick={() => { exportStems(); setIsFileMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-md hover:bg-white/10 transition-all text-[11px] font-black uppercase tracking-wider text-emerald-300 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-emerald-400" /> Export Stems (.wav)
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>



        {/* Instrument Selector */}
        <button
          onClick={() => setIsInstrumentMenuOpen(!isInstrumentMenuOpen)}
          className="flex items-center gap-3.5 px-6 py-3 rounded-md bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 shadow-md"
        >
          <span className="group-hover:scale-110 transition-transform flex items-center justify-center text-indigo-400">
            {currentInstrument.icon && typeof currentInstrument.icon !== 'string' ? (
              <currentInstrument.icon size={22} strokeWidth={1.5} />
            ) : (
              <span className="text-xl">{currentInstrument.icon}</span>
            )}
          </span>
          <div className="hidden lg:flex flex-col text-left select-none">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">INSTRUMENT</span>
            <span className="text-[13px] font-black text-white mt-1 leading-none">{currentInstrument.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isInstrumentMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* FX Toggle */}
        <button
          onClick={() => setIsFxOpen(!isFxOpen)}
          className={`w-12 h-12 rounded-md flex items-center justify-center transition-all duration-300 relative group cursor-pointer hover:scale-[1.02] active:scale-95 ${
            isFxOpen 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Master FX"
        >
          <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          {isFxOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        {/* Studio Utilities Dashboard Toggle */}
        <button
          onClick={() => { setIsDashboardOpen(!isDashboardOpen); setIsFxOpen(false); }}
          className={`w-12 h-12 rounded-md flex items-center justify-center transition-all duration-300 relative group cursor-pointer hover:scale-[1.02] active:scale-95 ${
            isDashboardOpen 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white'
          }`}
          title="Studio Dashboard"
        >
          <Sliders className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          {isDashboardOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#00f0ff]" />}
        </button>

        {/* Help */}
        <button
          onClick={openGuide}
          className="w-12 h-12 rounded-md flex items-center justify-center bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          title="Studio Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Manual */}
        <button
          onClick={openManual}
          className="w-12 h-12 rounded-md flex items-center justify-center bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          title="User Manual"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        {/* PWA Install Button */}
        {installPrompt && (
          <button
            onClick={handleInstall}
            className="px-4 h-11 rounded-2xl flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff3366] to-[#ff9f43] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
            title="Install Melody Sketcher Desktop App"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span className="hidden lg:inline">Install App</span>
          </button>
        )}

        {/* Futuristic Studio Clock & Date */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-dark border border-white/[0.08] shadow-[inset_0_1px_8px_rgba(0,240,255,0.06)] relative overflow-hidden group select-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
          {/* Pulsating status dot matching theme */}
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" 
            style={{ 
              backgroundColor: currentTheme.color,
              boxShadow: `0 0 10px ${currentTheme.color}`
            }} 
          />
          <div className="flex items-baseline gap-2 tabular-nums leading-none">
            <span className="text-[13px] font-black text-slate-100">{formattedTime}</span>
            <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">{formattedDate}</span>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
