import { useState, useEffect } from 'react';
import { Plus, X, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { TRACK_COLORS, INSTRUMENTS } from '../constants/midiConstants';

export default function TrackTabs({
  layers,
  setLayers,
  activeLayerId,
  setActiveLayerId,
  removeLayer,
  trackActivity,
  viewMode,
  clearActiveTrack,
  transposeActiveTrack
}) {
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editName, setEditName] = useState('');


  const handleSaveEdit = (layerId) => {
    const trimmed = editName.trim();
    if (trimmed) {
      setLayers(prev => prev.map(l => l.id === layerId ? { ...l, name: trimmed } : l));
    }
    setEditingLayerId(null);
  };

  const handleKeyDown = (e, layerId) => {
    if (e.key === 'Enter') {
      handleSaveEdit(layerId);
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
    }
  };

  // Track recent activity via effect to avoid impure Date.now() in render
  const [recentActivityIds, setRecentActivityIds] = useState({});

  useEffect(() => {
    const now = Date.now();
    const active = {};
    let hasActive = false;
    for (const [id, timestamp] of Object.entries(trackActivity)) {
      if (now - timestamp < 400) {
        active[id] = true;
        hasActive = true;
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecentActivityIds(active);

    if (hasActive) {
      const timer = setTimeout(() => setRecentActivityIds({}), 400);
      return () => clearTimeout(timer);
    }
  }, [trackActivity]);

  return (
    <div className={`h-20 bg-black/35 backdrop-blur-3xl border-b border-white/[0.05] flex items-center gap-3 overflow-x-auto no-scrollbar z-40 relative shrink-0 transition-all duration-300 shadow-sm
      ${viewMode === 'studio' ? 'pl-22 pr-6' : 'px-8'}
    `}>
      {layers.map(layer => {
        const isActive = layer.id === activeLayerId;
        const recentActivity = recentActivityIds[layer.id];

        return (
          <div 
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer group relative border hover:scale-[1.02] active:scale-[0.98]
              ${isActive 
                ? 'bg-white/[0.08] text-white border-white/[0.15] shadow-[0_4px_16px_rgba(0,0,0,0.25)] glass-gloss' 
                : 'bg-white/[0.02] text-slate-400 border-white/[0.04] hover:bg-white/[0.04] hover:text-slate-200 glass-gloss'
              }
            `}
          >
            {/* Color dot with activity pulse */}
            <span 
              className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${recentActivity ? 'scale-135' : ''}`} 
              style={{ 
                background: layer.color,
                boxShadow: isActive || recentActivity ? `0 0 10px ${layer.color}e0` : 'none'
              }} 
            />
            
            <input
              type="text"
              value={editingLayerId === layer.id ? editName : layer.name}
              onFocus={() => {
                setEditingLayerId(layer.id);
                setEditName(layer.name);
              }}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleSaveEdit(layer.id)}
              onKeyDown={(e) => handleKeyDown(e, layer.id)}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border border-transparent hover:border-white/10 focus:border-white/25 focus:bg-black/60 text-white rounded-lg px-2 py-0.5 text-[11px] font-black outline-none w-32 uppercase tracking-wider transition-all cursor-text placeholder-white/30"
              title="Click to rename"
              style={{
                textShadow: isActive ? `0 0 12px ${layer.color}40` : 'none'
              }}
              placeholder="Unnamed"
            />
            <span className="opacity-50 text-[9px] font-bold ml-1 leading-none tracking-widest">({layer.instrument.name})</span>
            
            {/* Inline controls */}
            <div className={`flex items-center gap-1.5 ml-2 transition-opacity duration-300 ${layer.mute || layer.solo ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, mute: !l.mute } : l));
                }}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  layer.mute 
                    ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                    : isActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
                title="Mute"
              >
                M
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, solo: !l.solo } : l));
                }}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  layer.solo 
                    ? 'bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : isActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
                title="Solo"
              >
                S
              </button>
              {layers.length > 1 && (
                <button
                  onClick={(e) => removeLayer(layer.id, e)}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all text-white/40 hover:text-white hover:bg-rose-500/80 cursor-pointer shadow-sm active:scale-90"
                  title="Delete Track"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
      
      <button 
        onClick={() => {
          const newId = Date.now();
          setLayers(prev => [...prev, { 
            id: newId, 
            name: `Track ${prev.length + 1}`, 
            instrument: INSTRUMENTS[0], 
            notes: [],
            color: TRACK_COLORS[prev.length % TRACK_COLORS.length],
            volume: 0,
            pan: 0,
            mute: false,
            solo: false,
            attack: 0.01,
            decay: 0.2,
            sustain: 0.6,
            release: 0.8,
            cutoff: 20000,
            resonance: 1,
            humanize: false
          }]);
          setActiveLayerId(newId);
        }}
        className="w-10 h-10 rounded-2xl glass-gloss flex items-center justify-center text-slate-400 hover:text-white transition-all shrink-0 ml-1 cursor-pointer hover:scale-[1.05] active:scale-90"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="h-6 w-[1px] bg-white/10 shrink-0 ml-2" />

      {/* Track Utility Tools */}
      <div className="flex items-center gap-1.5 ml-2">
        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider mr-1 select-none">Tools:</span>
        <button
          onClick={() => transposeActiveTrack(12)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg glass-gloss text-slate-300 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
          title="Transpose +1 Octave"
        >
          <ArrowUp className="w-3.5 h-3.5 text-cyan-400" /> +12
        </button>
        <button
          onClick={() => transposeActiveTrack(-12)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg glass-gloss text-slate-300 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
          title="Transpose -1 Octave"
        >
          <ArrowDown className="w-3.5 h-3.5 text-pink-400" /> -12
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to clear all notes on this track?")) {
              clearActiveTrack();
            }
          }}
          className="flex items-center gap-1 px-3 py-2 rounded-lg glass-gloss text-rose-300 hover:text-rose-100 transition-all text-[9px] font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-sm"
          title="Clear Track Notes"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear
        </button>
      </div>
    </div>
  );
}
