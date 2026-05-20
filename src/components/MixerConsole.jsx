import { motion } from 'framer-motion';
import { Sliders } from 'lucide-react';
import * as Tone from 'tone';

export default function MixerConsole({
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  trackActivity,
  rhythmVolume,
  setRhythmVolume,
  rhythmMute,
  setRhythmMute,
  rhythmSolo,
  setRhythmSolo,
  masterVolume,
  setMasterVolume,
  setIsInstrumentMenuOpen,
  currentTheme,
  closeConsole
}) {
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 260, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="glass-dark flex flex-col z-35 relative shrink-0 overflow-hidden animate-glow border-t border-white/[0.06]"
      style={{ '--glow-color': currentTheme.color }}
    >
      {/* Mixer Header */}
      <div className="h-12 bg-black/40 border-b border-white/5 px-8 flex items-center justify-between text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-5">
          <span className="text-[12px] font-black text-slate-300 uppercase tracking-[0.25em] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> MULTI-CHANNEL CONSOLE
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SSL_EMULATION_RACK</span>
        </div>
        <button 
          onClick={closeConsole}
          className="text-[11px] font-black hover:text-white transition-all uppercase tracking-widest cursor-pointer px-4 py-1.5 rounded-lg glass-gloss"
        >
          HIDE_MIXER
        </button>
      </div>

      {/* Mixer channel strips layout */}
      <div className="flex-1 flex gap-6 px-8 py-5 overflow-x-auto no-scrollbar items-center">
        
        {/* Individual Layers Channel Strips */}
        {layers.map(layer => {
          const isSelected = layer.id === activeLayerId;
          const panPct = (((layer.pan ?? 0) - -1) / 2) * 100;
          const volPct = (((layer.volume ?? 0) - -60) / 66) * 100;

          return (
            <div 
              key={layer.id}
              className={`w-36 h-[210px] rounded-[24px] transition-all duration-300 flex flex-col items-center p-4 shrink-0 relative cursor-pointer border
                ${isSelected 
                  ? 'border-white/20 bg-gradient-to-b from-white/[0.08] to-black/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
                  : 'border-white/5 bg-black/20 hover:bg-white/[0.03] hover:border-white/10'}`}
              onClick={() => setActiveLayerId(layer.id)}
            >
              {/* Track color band */}
              <div 
                className="absolute top-0 left-4 right-4 h-1.5 rounded-b shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all" 
                style={{ 
                  backgroundColor: layer.color, 
                  boxShadow: isSelected ? `0 0 15px ${layer.color}90` : 'none' 
                }} 
              />
              
              {/* Editable Track Name */}
              <input
                type="text"
                value={layer.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, name: val } : l));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-center bg-transparent border-none text-[12px] font-black uppercase tracking-wider text-slate-200 focus:outline-none focus:text-white mt-1 cursor-text truncate"
              />
              
              {/* Panning slider with custom track */}
              <div className="w-full flex flex-col items-center mt-2 relative select-none">
                <div className="relative flex items-center h-4 w-16 group" onClick={(e) => e.stopPropagation()}>
                  <div className="absolute left-0 right-0 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-white/30" style={{ width: '100%' }} />
                  </div>
                  <div 
                    className="absolute w-2 h-2 rounded-full bg-white border border-white/40 group-hover:scale-125 transition-transform duration-200 pointer-events-none"
                    style={{ left: `calc(${panPct}% - 4px)` }}
                  />
                  <input 
                    type="range" min="-1" max="1" step="0.1"
                    value={layer.pan ?? 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, pan: val } : l));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title={`Pan: ${layer.pan}`}
                  />
                </div>
                <div className="flex justify-between w-16 text-[9px] text-slate-500 mt-0.5 select-none leading-none font-bold">
                  <span>L</span>
                  <span>C</span>
                  <span>R</span>
                </div>
              </div>

              {/* Solo / Mute hardware buttons */}
              <div className="flex gap-2 mt-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, solo: !l.solo } : l));
                  }}
                  className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all cursor-pointer active:scale-90
                    ${layer.solo 
                      ? 'bg-emerald-500 border border-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                      : 'glass-gloss text-slate-400 hover:text-slate-200'}`}
                  title="Solo Track"
                >
                  S
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, mute: !l.mute } : l));
                  }}
                  className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all cursor-pointer active:scale-90
                    ${layer.mute 
                      ? 'bg-amber-500 border border-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                      : 'glass-gloss text-slate-400 hover:text-slate-200'}`}
                  title="Mute Track"
                >
                  M
                </button>
              </div>

              {/* Volume Fader & peak Meter */}
              <div className="flex items-center justify-center gap-4 mt-2.5 w-full h-16 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                {/* Custom Vertical Fader Column with tick marks */}
                <div className="w-10 h-14 relative flex items-center justify-center group">
                  {/* Fader slot background */}
                  <div className="absolute top-0 bottom-0 w-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full rounded-full"
                      style={{ 
                        height: `${volPct}%`, 
                        background: `linear-gradient(to top, ${layer.color}aa, ${layer.color})`,
                        boxShadow: `0 0 10px ${layer.color}`
                      }}
                    />
                  </div>
                  
                  {/* Fader Tick marks */}
                  <div className="absolute inset-y-0 left-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>+6</span>
                    <span>0</span>
                    <span>-12</span>
                    <span>-40</span>
                  </div>
                  <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                  </div>

                  {/* Hardware Fader Cap */}
                  <div 
                    className="absolute w-6 h-3 flex flex-col items-center justify-center bg-gradient-to-b from-[#2a2a30] via-[#151518] to-[#1e1e22] border border-white/20 rounded shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:scale-110 group-hover:border-white/35 transition-all duration-150 pointer-events-none z-10"
                    style={{ bottom: `calc(${volPct}% - 6px)` }}
                  >
                    {/* Centered color line */}
                    <div className="w-full h-[2px] shadow-sm" style={{ backgroundColor: layer.color }} />
                  </div>

                  <input
                    type="range" min="-60" max="6" step="10"
                    value={layer.volume ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, volume: val } : l));
                    }}
                    className="w-14 h-6 absolute -rotate-90 origin-center cursor-pointer opacity-0 z-20"
                  />
                </div>

                {/* Hardware animated peak decay meter */}
                <div className="w-1.5 h-14 bg-white/10 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    key={trackActivity[layer.id]}
                    className="w-full rounded-full peak-active"
                    style={{ 
                      background: `linear-gradient(to top, ${layer.color}, white)`,
                      '--accent': layer.color
                    }}
                  />
                </div>
              </div>

              {/* Volume level Label & Instrument link */}
              <div className="w-full flex justify-between items-center px-1 text-[9px] font-black text-slate-400 mt-2.5 uppercase tracking-wider select-none leading-none truncate">
                <span className="text-white shrink-0">{(layer.volume ?? 0) > -60 ? `${layer.volume}dB` : '-inf'}</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveLayerId(layer.id);
                    setIsInstrumentMenuOpen(true);
                  }}
                  className="truncate max-w-[50px] hover:text-white transition-colors cursor-pointer text-right text-indigo-300 hover:underline" 
                  title="Change Instrument"
                >
                  {layer.instrument.name}
                </span>
              </div>
            </div>
          );
        })}

        <div className="w-px h-full bg-white/20 shrink-0 self-stretch my-1" />

        {/* Rhythm (Drum Bus) Channel Strip */}
        {(() => {
          const drumVolPct = ((rhythmVolume - -60) / 66) * 100;
          return (
            <div className="w-36 h-[210px] rounded-[24px] bg-gradient-to-b from-indigo-500/[0.08] to-black/40 border border-indigo-500/30 flex flex-col items-center p-4 shrink-0 relative shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              <div className="absolute top-0 left-4 right-4 h-1.5 rounded-b bg-indigo-400 shadow-[0_2px_15px_rgba(129,140,248,0.8)]" />
              <span className="text-[12px] font-black uppercase tracking-wider text-indigo-300 mt-1 select-none">DRUM BUS</span>
              
              {/* Stereo Center/Pan label placeholder */}
              <div className="w-full flex flex-col items-center mt-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-[7px] font-black text-indigo-300">CENTER</span>
                </div>
                <div className="flex justify-between w-16 text-[9px] text-slate-500 mt-1 select-none leading-none font-bold">
                  <span>L</span>
                  <span>C</span>
                  <span>R</span>
                </div>
              </div>

              {/* Rhythm Bus Solo / Mute */}
              <div className="flex gap-2 mt-2 shrink-0">
                <button
                  onClick={() => setRhythmSolo(!rhythmSolo)}
                  className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all cursor-pointer active:scale-90
                    ${rhythmSolo 
                      ? 'bg-emerald-500 border border-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                      : 'glass-gloss text-slate-400 hover:text-slate-200'}`}
                  title="Solo Rhythm Section"
                >
                  S
                </button>
                <button
                  onClick={() => setRhythmMute(!rhythmMute)}
                  className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all cursor-pointer active:scale-90
                    ${rhythmMute 
                      ? 'bg-amber-500 border border-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                      : 'glass-gloss text-slate-400 hover:text-slate-200'}`}
                  title="Mute Rhythm Section"
                >
                  M
                </button>
              </div>

              {/* Fader & Peak meter */}
              <div className="flex items-center justify-center gap-4 mt-2.5 w-full h-16 shrink-0 relative">
                {/* Custom Vertical Fader Column with tick marks */}
                <div className="w-10 h-14 relative flex items-center justify-center group">
                  {/* Fader slot background */}
                  <div className="absolute top-0 bottom-0 w-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full rounded-full"
                      style={{ 
                        height: `${drumVolPct}%`, 
                        background: 'linear-gradient(to top, #818cf8aa, #818cf8)',
                        boxShadow: '0 0 10px #818cf8'
                      }}
                    />
                  </div>

                  {/* Fader Tick marks */}
                  <div className="absolute inset-y-0 left-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>+6</span>
                    <span>0</span>
                    <span>-12</span>
                    <span>-40</span>
                  </div>
                  <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                  </div>

                  {/* Hardware Fader Cap */}
                  <div 
                    className="absolute w-6 h-3 flex flex-col items-center justify-center bg-gradient-to-b from-[#2a2a30] via-[#151518] to-[#1e1e22] border border-white/20 rounded shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:scale-110 group-hover:border-white/35 transition-all duration-150 pointer-events-none z-10"
                    style={{ bottom: `calc(${drumVolPct}% - 6px)` }}
                  >
                    {/* Centered color line */}
                    <div className="w-full h-[2px] shadow-sm bg-[#818cf8]" />
                  </div>

                  <input
                    type="range" min="-60" max="6" step="10"
                    value={rhythmVolume}
                    onChange={(e) => setRhythmVolume(parseInt(e.target.value))}
                    className="w-14 h-6 absolute -rotate-90 origin-center cursor-pointer opacity-0 z-20"
                  />
                </div>

                {/* Animated peak decay meter linked to playback */}
                <div className="w-1.5 h-14 bg-white/10 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    key={trackActivity['rhythm']}
                    className="w-full rounded-full peak-active"
                    style={{ 
                      background: 'linear-gradient(to top, #818cf8, white)',
                      '--accent': '#818cf8'
                    }}
                  />
                </div>
              </div>

              {/* Volume display */}
              <div className="w-full flex justify-between items-center px-1 text-[9px] font-black text-slate-400 mt-2.5 uppercase tracking-wider select-none leading-none truncate">
                <span className="text-white">{rhythmVolume > -60 ? `${rhythmVolume}dB` : '-inf'}</span>
                <span className="text-indigo-300 font-extrabold text-[8px]">DRUMS</span>
              </div>
            </div>
          );
        })()}

        <div className="w-px h-full bg-white/20 shrink-0 self-stretch my-1" />

        {/* Master Output Channel Strip */}
        {(() => {
          const masterVolPct = ((masterVolume - -60) / 70) * 100;
          return (
            <div className="w-36 h-[210px] rounded-[24px] bg-gradient-to-b from-white/[0.08] to-black/60 border border-white/20 transition-all flex flex-col items-center p-4 shrink-0 relative shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 left-4 right-4 h-1.5 rounded-b bg-white shadow-[0_2px_15px_rgba(255,255,255,0.8)]" />
              
              <span className="text-[12px] font-black uppercase tracking-wider text-slate-100 mt-1 select-none leading-none">MASTER</span>
              
              {/* Pan (Centered) */}
              <div className="w-full flex flex-col items-center mt-2 opacity-60">
                <div className="h-1.5 w-16 bg-white/10 rounded-full mt-2 relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex justify-between w-16 text-[9px] text-slate-500 mt-1 leading-none font-bold">
                  <span>L</span>
                  <span>C</span>
                  <span>R</span>
                </div>
              </div>

              {/* Master Mute button only */}
              <div className="flex gap-2 mt-2 shrink-0">
                <div className="w-8 h-6 opacity-0" />
                <button
                  onClick={() => {
                    const nextMute = !Tone.Destination.mute;
                    Tone.Destination.mute = nextMute;
                    setLayers(prev => [...prev]); // trigger state update hook
                  }}
                  className={`w-8 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all cursor-pointer active:scale-90
                    ${Tone.Destination.mute 
                      ? 'bg-amber-500 border border-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                      : 'glass-gloss text-slate-400 hover:text-slate-200'}`}
                  title="Mute Master Output"
                >
                  M
                </button>
              </div>

              {/* Master Fader & Master peak level meter */}
              <div className="flex items-center justify-center gap-4 mt-2.5 w-full h-16 shrink-0 relative">
                {/* Custom Vertical Fader Column with tick marks */}
                <div className="w-10 h-14 relative flex items-center justify-center group">
                  {/* Fader slot background */}
                  <div className="absolute top-0 bottom-0 w-1.5 rounded-full bg-black/60 border border-white/5 overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full rounded-full"
                      style={{ 
                        height: `${masterVolPct}%`, 
                        background: 'linear-gradient(to top, rgba(255,255,255,0.6), #ffffff)',
                        boxShadow: '0 0 10px #ffffff'
                      }}
                    />
                  </div>

                  {/* Fader Tick marks */}
                  <div className="absolute inset-y-0 left-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>+10</span>
                    <span>0</span>
                    <span>-12</span>
                    <span>-40</span>
                  </div>
                  <div className="absolute inset-y-0 right-1.5 flex flex-col justify-between pointer-events-none text-[6px] font-black text-slate-600 select-none">
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                    <span>—</span>
                  </div>

                  {/* Hardware Fader Cap */}
                  <div 
                    className="absolute w-6 h-3 flex flex-col items-center justify-center bg-gradient-to-b from-[#2a2a30] via-[#151518] to-[#1e1e22] border border-white/20 rounded shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:scale-110 group-hover:border-white/35 transition-all duration-150 pointer-events-none z-10"
                    style={{ bottom: `calc(${masterVolPct}% - 6px)` }}
                  >
                    {/* Centered color line */}
                    <div className="w-full h-[2px] shadow-sm bg-white" />
                  </div>

                  <input
                    type="range" min="-60" max="10" step="10"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                    className="w-14 h-6 absolute -rotate-90 origin-center cursor-pointer opacity-0 z-20"
                  />
                </div>

                <div className="w-1.5 h-14 bg-white/10 rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    key={Object.values(trackActivity).reduce((a, b) => a + b, 0)}
                    className="w-full rounded-full peak-active"
                    style={{ 
                      background: `linear-gradient(to top, #ffffff, ${currentTheme?.color || '#7c3aed'})`,
                      '--accent': '#ffffff'
                    }}
                  />
                </div>
              </div>

              {/* Output tag */}
              <div className="w-full flex justify-between items-center px-1 text-[9px] font-black text-slate-400 mt-2.5 uppercase tracking-wider select-none leading-none">
                <span className="text-white">{masterVolume > -60 ? `${masterVolume}dB` : '-inf'}</span>
                <span className="font-extrabold text-[8px]">STEREO</span>
              </div>
            </div>
          );
        })()}

      </div>
    </motion.div>
  );
}
