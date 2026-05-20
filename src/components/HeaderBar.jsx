import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Minus,
  Plus,
  Upload,
  Download,
  Sparkles,
  ChevronDown,
  Settings2,
  HelpCircle,
  Sliders,
  BookOpen
} from 'lucide-react';
import {
  THEMES,
  DEMO_SONGS,
  getThemeBg
} from '../constants/midiConstants';

export default function HeaderBar({
  currentTheme,
  setCurrentTheme,
  barCount,
  setBarCount,
  zoom,
  setZoom,
  fileInputRef,
  exportMidi,
  exportWav,
  loadDemoSong,
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
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);

  const dropdownStyle = {
    background: 'rgba(8,8,12,0.96)',
    backdropFilter: 'blur(40px) saturate(140%)',
    boxShadow: `0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(255,255,255,0.06)`
  };

  return (
    <header className="h-20 bg-black/45 backdrop-blur-3xl border-b border-white/[0.06] flex items-center justify-center px-4 z-50 shrink-0 relative gap-6 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top accent neon line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-1000"
        style={{
          background: getThemeBg(currentTheme),
          boxShadow: `0 0 12px ${currentTheme.color}90`
        }}
      />

      <div className="w-full max-w-[1600px] px-16 flex items-center justify-between gap-6">
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
              MELODY <span style={{ color: currentTheme.color, textShadow: `0 0 16px ${currentTheme.color}c0` }}>SKETCHER</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">STUDIO</span>
              <span className="text-[7px] font-extrabold text-white/80 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/5 shadow-sm leading-none">PRO</span>
            </div>
          </div>
        </div>

        <div className="w-px h-10 bg-white/[0.08]" />

        {/* Bar Length */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-2xl px-2 py-1.5 border border-white/[0.06] shadow-md">
          <button
            onClick={() => setBarCount(Math.max(1, barCount - 1))}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="px-2 py-0.5 text-center select-none min-w-[60px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">BARS</span>
            <span className="text-[13px] font-black text-white tabular-nums block mt-0.5">{barCount}</span>
          </div>
          <button
            onClick={() => setBarCount(barCount + 1)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-2xl px-2 py-1.5 border border-white/[0.06] shadow-md">
          <button
            onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="px-2 py-0.5 text-center select-none min-w-[60px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">ZOOM</span>
            <span className="text-[13px] font-black text-white tabular-nums block mt-0.5">{Math.round(zoom * 100)}%</span>
          </div>
          <button
            onClick={() => setZoom(Math.min(4, zoom + 0.1))}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300 hover:text-white cursor-pointer active:scale-90"
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
            onClick={() => { setIsFileMenuOpen(!isFileMenuOpen); setIsDemoMenuOpen(false); setIsThemeMenuOpen(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-gloss transition-all text-[11px] font-black uppercase tracking-wider text-slate-200 hover:text-white cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">File</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isFileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 rounded-2xl p-2 z-50 w-48"
                style={dropdownStyle}
              >
                <button
                  onClick={() => { fileInputRef.current.click(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-slate-400" /> Import MIDI
                </button>
                <button
                  onClick={() => { exportMidi(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-400" /> Export MIDI (.mid)
                </button>
                <div className="h-px bg-white/10 my-1 mx-2" />
                <button
                  onClick={() => { exportWav(); setIsFileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-wider text-slate-200 cursor-pointer"
                >
                  <Music className="w-4 h-4 text-indigo-400" /> Render WAV
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demos */}
        <div className="relative">
          <button
            onClick={() => { setIsDemoMenuOpen(!isDemoMenuOpen); setIsFileMenuOpen(false); setIsThemeMenuOpen(false); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-gloss text-indigo-300 hover:text-indigo-200 transition-all text-[11px] font-black uppercase tracking-wider cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Demos</span>
          </button>
          <AnimatePresence>
            {isDemoMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 rounded-2xl p-2 z-50 w-56"
                style={dropdownStyle}
              >
                <div className="px-3 py-2 mb-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Load Demo</span>
                </div>
                {DEMO_SONGS.map((song) => (
                  <button
                    key={song.name}
                    onClick={() => { loadDemoSong(song); setIsDemoMenuOpen(false); }}
                    className="flex flex-col items-start w-full px-3 py-2.5 rounded-xl transition-all hover:bg-white/10 cursor-pointer"
                  >
                    <span className="text-[12px] font-bold text-white leading-none">{song.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1.5">{song.bpm} BPM · {song.tracks.length} tracks</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-10 bg-white/[0.08]" />

        {/* Instrument Selector */}
        <button
          onClick={() => setIsInstrumentMenuOpen(!isInstrumentMenuOpen)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-gloss transition-all cursor-pointer group hover:scale-[1.02] active:scale-95"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">{currentInstrument.icon}</span>
          <div className="hidden lg:flex flex-col text-left select-none">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">INSTRUMENT</span>
            <span className="text-[12px] font-bold text-white mt-1 leading-none">{currentInstrument.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isInstrumentMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* FX Toggle */}
        <button
          onClick={() => setIsFxOpen(!isFxOpen)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer hover:scale-[1.02] active:scale-95 ${
            isFxOpen 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'glass-gloss text-slate-300 hover:text-white'
          }`}
          title="Master FX"
        >
          <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
          {isFxOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />}
        </button>

        {/* Studio Utilities Dashboard Toggle */}
        <button
          onClick={() => { setIsDashboardOpen(!isDashboardOpen); setIsFxOpen(false); }}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer hover:scale-[1.02] active:scale-95 ${
            isDashboardOpen 
              ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
              : 'glass-gloss text-slate-300 hover:text-white'
          }`}
          title="Studio Dashboard"
        >
          <Sliders className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          {isDashboardOpen && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />}
        </button>

        {/* Help */}
        <button
          onClick={openGuide}
          className="w-11 h-11 rounded-2xl flex items-center justify-center glass-gloss text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          title="Studio Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* User Manual */}
        <button
          onClick={openManual}
          className="w-11 h-11 rounded-2xl flex items-center justify-center glass-gloss text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          title="User Manual"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        {/* Theme Selector */}
        <div className="relative">
          <button
            onClick={() => { setIsThemeMenuOpen(!isThemeMenuOpen); setIsFileMenuOpen(false); setIsDemoMenuOpen(false); }}
            className="w-11 h-11 rounded-full border border-white/[0.08] p-1 relative overflow-hidden group hover:border-white/20 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
            title="Theme"
          >
            <div className="w-full h-full rounded-full transition-transform group-hover:scale-110" style={{ background: getThemeBg(currentTheme) }} />
          </button>
          <AnimatePresence>
            {isThemeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-16 rounded-2xl p-2 z-50 w-48"
                style={dropdownStyle}
              >
                <div className="px-3 py-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theme</span>
                </div>
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => { setCurrentTheme(theme); setIsThemeMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      currentTheme.id === theme.id ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ background: getThemeBg(theme) }} />
                    <span className="text-[11px] font-bold text-slate-200">{theme.name}</span>
                    {currentTheme.id === theme.id && <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </header>
  );
}
