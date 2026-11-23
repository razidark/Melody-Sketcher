import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sliders, 
  Wand2, 
  BookOpen, 
  X, 
  ChevronRight, 
  Sparkles,
  Music,
  Disc
} from 'lucide-react';
import { ALL_NOTES } from '../constants/midiConstants';

const SCALES = {
  chromatic: { name: 'Chromatic (All)', notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] },
  cMajor: { name: 'C Major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  aMinor: { name: 'A Minor / Aeolian', notes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
  pentatonicMajor: { name: 'C Pentatonic Major', notes: ['C', 'D', 'E', 'G', 'A'] },
  pentatonicMinor: { name: 'A Pentatonic Minor', notes: ['A', 'C', 'D', 'E', 'G'] },
  blues: { name: 'Blues Scale', notes: ['C', 'D#', 'F', 'F#', 'G', 'A#'] }
};

const CHORD_PRESETS = [
  {
    name: 'Lofi Chill Progression',
    description: 'Jazz-flavored chords: Em9 - Am9 - D7 - Gmaj7',
    chords: [
      { notes: ['E3', 'G3', 'B3', 'D4', 'F#4'], tick: 0 },
      { notes: ['E3', 'G3', 'B3', 'D4', 'F#4'], tick: 8 },
      { notes: ['A3', 'C4', 'E4', 'G4', 'B4'], tick: 16 },
      { notes: ['A3', 'C4', 'E4', 'G4', 'B4'], tick: 24 },
      { notes: ['D3', 'F#3', 'A3', 'C4'], tick: 32 },
      { notes: ['D3', 'F#3', 'A3', 'C4'], tick: 40 },
      { notes: ['G3', 'B3', 'D4', 'F#4'], tick: 48 },
      { notes: ['G3', 'B3', 'D4', 'F#4'], tick: 56 }
    ]
  },
  {
    name: 'Pop Anthem Progression',
    description: 'Energetic classic progression: C - G - Am - F',
    chords: [
      { notes: ['C3', 'E3', 'G3', 'C4'], tick: 0 },
      { notes: ['C3', 'E3', 'G3', 'C4'], tick: 8 },
      { notes: ['G2', 'B2', 'D3', 'G3'], tick: 16 },
      { notes: ['G2', 'B2', 'D3', 'G3'], tick: 24 },
      { notes: ['A2', 'C3', 'E3', 'A3'], tick: 32 },
      { notes: ['A2', 'C3', 'E3', 'A3'], tick: 40 },
      { notes: ['F2', 'A2', 'C3', 'F3'], tick: 48 },
      { notes: ['F2', 'A2', 'C3', 'F3'], tick: 56 }
    ]
  },
  {
    name: 'Synthwave Neon Chords',
    description: 'Retro futuristic progression: Am - G - F - E',
    chords: [
      { notes: ['A3', 'C4', 'E4'], tick: 0 },
      { notes: ['A3', 'C4', 'E4'], tick: 8 },
      { notes: ['G3', 'B3', 'D4'], tick: 16 },
      { notes: ['G3', 'B3', 'D4'], tick: 24 },
      { notes: ['F3', 'A3', 'C4'], tick: 32 },
      { notes: ['F3', 'A3', 'C4'], tick: 40 },
      { notes: ['E3', 'G#3', 'B3'], tick: 48 },
      { notes: ['E3', 'G#3', 'B3'], tick: 56 }
    ]
  }
];

const DRUM_PRESETS = [
  {
    name: 'Four-on-the-Floor (House/Disco)',
    description: 'Solid kicks on every beat, snare on 4 and 12, running hi-hats',
    notes: [
      // Kicks
      { name: 'C1', tick: 0 }, { name: 'C1', tick: 4 }, { name: 'C1', tick: 8 }, { name: 'C1', tick: 12 },
      { name: 'C1', tick: 16 }, { name: 'C1', tick: 20 }, { name: 'C1', tick: 24 }, { name: 'C1', tick: 28 },
      { name: 'C1', tick: 32 }, { name: 'C1', tick: 36 }, { name: 'C1', tick: 40 }, { name: 'C1', tick: 44 },
      { name: 'C1', tick: 48 }, { name: 'C1', tick: 52 }, { name: 'C1', tick: 56 }, { name: 'C1', tick: 60 },
      // Snares
      { name: 'C3', tick: 4 }, { name: 'C3', tick: 12 }, { name: 'C3', tick: 20 }, { name: 'C3', tick: 28 },
      { name: 'C3', tick: 36 }, { name: 'C3', tick: 44 }, { name: 'C3', tick: 52 }, { name: 'C3', tick: 60 },
      // Hihats
      { name: 'C4', tick: 2 }, { name: 'C4', tick: 6 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 14 },
      { name: 'C4', tick: 18 }, { name: 'C4', tick: 22 }, { name: 'C4', tick: 26 }, { name: 'C4', tick: 30 },
      { name: 'C4', tick: 34 }, { name: 'C4', tick: 38 }, { name: 'C4', tick: 42 }, { name: 'C4', tick: 46 },
      { name: 'C4', tick: 50 }, { name: 'C4', tick: 54 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 62 }
    ]
  },
  {
    name: 'Boom Bap (Hip Hop Groove)',
    description: 'Classic crunchy swing: kicks on 0, 5, 10, snare on 4 and 12',
    notes: [
      // Kicks
      { name: 'C1', tick: 0 }, { name: 'C1', tick: 10 }, { name: 'C1', tick: 16 }, { name: 'C1', tick: 26 },
      { name: 'C1', tick: 32 }, { name: 'C1', tick: 42 }, { name: 'C1', tick: 48 }, { name: 'C1', tick: 58 },
      // Snares
      { name: 'C3', tick: 4 }, { name: 'C3', tick: 12 }, { name: 'C3', tick: 20 }, { name: 'C3', tick: 28 },
      { name: 'C3', tick: 36 }, { name: 'C3', tick: 44 }, { name: 'C3', tick: 52 }, { name: 'C3', tick: 60 },
      // Hihats
      { name: 'C4', tick: 0 }, { name: 'C4', tick: 2 }, { name: 'C4', tick: 4 }, { name: 'C4', tick: 6 },
      { name: 'C4', tick: 8 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 12 }, { name: 'C4', tick: 14 },
      { name: 'C4', tick: 16 }, { name: 'C4', tick: 18 }, { name: 'C4', tick: 20 }, { name: 'C4', tick: 22 },
      { name: 'C4', tick: 24 }, { name: 'C4', tick: 26 }, { name: 'C4', tick: 28 }, { name: 'C4', tick: 30 },
      { name: 'C4', tick: 32 }, { name: 'C4', tick: 34 }, { name: 'C4', tick: 36 }, { name: 'C4', tick: 38 },
      { name: 'C4', tick: 40 }, { name: 'C4', tick: 42 }, { name: 'C4', tick: 44 }, { name: 'C4', tick: 46 },
      { name: 'C4', tick: 48 }, { name: 'C4', tick: 50 }, { name: 'C4', tick: 52 }, { name: 'C4', tick: 54 },
      { name: 'C4', tick: 56 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 60 }, { name: 'C4', tick: 62 }
    ]
  },
  {
    name: '808 Trap Beat',
    description: 'Deep kicks, bright snares, rapid hi-hat rolls',
    notes: [
      // Kicks
      { name: 'C1', tick: 0 }, { name: 'C1', tick: 6 }, { name: 'C1', tick: 16 }, { name: 'C1', tick: 24 },
      { name: 'C1', tick: 32 }, { name: 'C1', tick: 38 }, { name: 'C1', tick: 48 }, { name: 'C1', tick: 56 },
      // Snares
      { name: 'C3', tick: 8 }, { name: 'C3', tick: 24 }, { name: 'C3', tick: 40 }, { name: 'C3', tick: 56 },
      // Hihats (with fast rolls)
      { name: 'C4', tick: 0 }, { name: 'C4', tick: 2 }, { name: 'C4', tick: 4 }, { name: 'C4', tick: 6 },
      { name: 'C4', tick: 8 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 11 }, { name: 'C4', tick: 12 },
      { name: 'C4', tick: 14 }, { name: 'C4', tick: 16 }, { name: 'C4', tick: 18 }, { name: 'C4', tick: 20 },
      { name: 'C4', tick: 22 }, { name: 'C4', tick: 24 }, { name: 'C4', tick: 25 }, { name: 'C4', tick: 26 },
      { name: 'C4', tick: 27 }, { name: 'C4', tick: 28 }, { name: 'C4', tick: 30 }, { name: 'C4', tick: 32 },
      { name: 'C4', tick: 34 }, { name: 'C4', tick: 36 }, { name: 'C4', tick: 38 }, { name: 'C4', tick: 40 },
      { name: 'C4', tick: 42 }, { name: 'C4', tick: 43 }, { name: 'C4', tick: 44 }, { name: 'C4', tick: 46 },
      { name: 'C4', tick: 48 }, { name: 'C4', tick: 50 }, { name: 'C4', tick: 52 }, { name: 'C4', tick: 54 },
      { name: 'C4', tick: 56 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 59 }, { name: 'C4', tick: 60 },
      { name: 'C4', tick: 62 }
    ]
  }
];

export default function StudioDashboard({
  activeLayer,
  setLayers,
  currentTheme,
  closeDashboard
}) {
  const [activeTab, setActiveTab] = useState('synth');
  


  // Synth controls handlers
  const handleSynthChange = (param, val) => {
    setLayers(prev => prev.map(l => l.id === activeLayer.id ? { ...l, [param]: val } : l));
  };

  // MIDI Tools Quantize Pitch (Scale Snapping)
  const quantizePitch = (scaleKey) => {
    const scale = SCALES[scaleKey];
    if (!scale) return;

    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayer.id) return l;

      const quantizedNotes = l.notes.map(note => {
        // extract root note and octave (e.g. C#4 => root: C#, octave: 4)
        const match = note.name.match(/^([A-G]#?)(-?\d+)$/);
        if (!match) return note;

        const [, root, octave] = match;
        
        // Find the closest scale note root
        const pitchIndex = SCALES.chromatic.notes.indexOf(root);
        let bestRoot = scale.notes[0];
        let minDiff = 12;

        scale.notes.forEach(scaleRoot => {
          const scaleIndex = SCALES.chromatic.notes.indexOf(scaleRoot);
          
          // Compute difference considering wrapping
          let diff = Math.abs(pitchIndex - scaleIndex);
          if (diff > 6) diff = 12 - diff;

          if (diff < minDiff) {
            minDiff = diff;
            bestRoot = scaleRoot;
          }
        });

        const newName = `${bestRoot}${octave}`;
        const noteObj = ALL_NOTES.find(n => n.name === newName);
        if (!noteObj) return note;

        return {
          ...note,
          name: newName,
          index: ALL_NOTES.indexOf(noteObj)
        };
      });

      return { ...l, notes: quantizedNotes };
    }));
  };

  // MIDI Tools Quantize Time (Grid Snapping)
  const quantizeTime = (division) => {
    // division can be: 4 (quarter note = 4 ticks), 2 (8th note = 2 ticks), 1 (16th note = 1 tick)
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayer.id) return l;

      const quantizedNotes = l.notes.map(note => {
        const snappedTick = Math.round(note.tick / division) * division;
        return {
          ...note,
          tick: snappedTick
        };
      });

      // Filter duplicates at the same tick/index
      const uniqueNotes = [];
      const seen = new Set();
      quantizedNotes.forEach(n => {
        const key = `${n.tick}-${n.index}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueNotes.push(n);
        }
      });

      return { ...l, notes: uniqueNotes };
    }));
  };

  // Destructive Humanize notes (adds micro velocity/offsets)
  const applyHumanizeNotes = () => {
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayer.id) return l;

      const humanizedNotes = l.notes.map(note => {
        // Since step-seq notes are grid snapped, we can randomize velocity
        // or shift tick by +/- 1 tick occasionally (20% chance)
        let shiftedTick = note.tick;
        if (Math.random() < 0.2) {
          const shift = Math.random() < 0.5 ? -1 : 1;
          shiftedTick = Math.max(0, note.tick + shift);
        }
        return {
          ...note,
          tick: shiftedTick,
          velocity: 0.65 + Math.random() * 0.35 // Custom velocity parameter
        };
      });

      return { ...l, notes: humanizedNotes };
    }));
  };

  // Pattern library loaders
  const loadPresetChords = (preset) => {
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayer.id) return l;

      const newNotes = [];
      preset.chords.forEach(chord => {
        chord.notes.forEach(noteName => {
          const noteObj = ALL_NOTES.find(n => n.name === noteName);
          if (noteObj) {
            newNotes.push({
              name: noteName,
              tick: chord.tick,
              index: ALL_NOTES.indexOf(noteObj)
            });
          }
        });
      });

      return { ...l, notes: newNotes };
    }));
  };

  const loadPresetDrums = (preset) => {
    setLayers(prev => prev.map(l => {
      if (l.id !== activeLayer.id) return l;

      const newNotes = [];
      preset.notes.forEach(drum => {
        const noteObj = ALL_NOTES.find(n => n.name === drum.name);
        if (noteObj) {
          newNotes.push({
            name: drum.name,
            tick: drum.tick,
            index: ALL_NOTES.indexOf(noteObj)
          });
        }
      });

      return { ...l, notes: newNotes };
    }));
  };



  return (
    <motion.div
      initial={{ x: 480, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 480, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 180 }}
      className="absolute right-5 top-5 bottom-5 w-[480px] border rounded-xl flex flex-col z-[45] overflow-hidden"
      style={{
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(35px) saturate(240%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: `0 24px 64px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.15), inset -2px 0 8px rgba(0,240,255,0.15), inset 2px 0 8px rgba(46,255,147,0.15), 0 0 40px -10px ${currentTheme.color}20`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4" style={{ color: currentTheme.color }} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">STUDIO UTILITIES</span>
        </div>
        <button
          onClick={closeDashboard}
          className="w-8 h-8 rounded-xl flex items-center justify-center glass-gloss text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-white/[0.02] border-b border-white/[0.06] p-1 gap-1">
        {[
          { id: 'synth', label: 'SYNTH', icon: Sliders },
          { id: 'midi', label: 'MIDI', icon: Wand2 },
          { id: 'library', label: 'PRESETS', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-slate-400 hover:text-slate-200 glass-gloss'
              }`}
            >
              <Icon className="w-4 h-4" style={isActive ? { color: currentTheme.color } : {}} />
              <span className="text-[8px] font-black tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
        
        {/* TAB 1: SYNTH CUSTOMIZER */}
        {activeTab === 'synth' && (
          <div className="space-y-6">
            <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Sound Design</h3>
              <p className="text-[9px] text-slate-400">Sculpt envelope (ADSR) & filter cutoff parameters for <span className="font-bold" style={{ color: activeLayer.color }}>{activeLayer.name}</span>.</p>
            </div>

            {/* ADSR Sliders */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">ADSR Envelope</h4>
              {[
                { param: 'attack', label: 'Attack', min: 0.001, max: 1.5, step: 0.01, unit: 's' },
                { param: 'decay', label: 'Decay', min: 0.01, max: 2.0, step: 0.01, unit: 's' },
                { param: 'sustain', label: 'Sustain', min: 0.0, max: 1.0, step: 0.05, unit: '%' },
                { param: 'release', label: 'Release', min: 0.01, max: 3.5, step: 0.05, unit: 's' }
              ].map(sld => {
                const val = activeLayer[sld.param] ?? (sld.param === 'sustain' ? 0.6 : sld.param === 'release' ? 0.8 : sld.param === 'decay' ? 0.2 : 0.01);
                return (
                  <div key={sld.param} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300">{sld.label}</span>
                      <span className="font-bold text-white tabular-nums">
                        {sld.param === 'sustain' ? Math.round(val * 100) : val.toFixed(2)}{sld.unit}
                      </span>
                    </div>
                    <div className="relative flex items-center h-6 select-none group">
                      <input 
                        type="range" min={sld.min} max={sld.max} step={sld.step}
                        value={val}
                        onChange={(e) => handleSynthChange(sld.param, Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {activeLayer.instrument?.id !== 'drum-kit' && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Oscillator Waveform</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'sine', label: 'Sine' },
                      { id: 'triangle', label: 'Triangle' },
                      { id: 'sawtooth', label: 'Saw' },
                      { id: 'square', label: 'Square' }
                    ].map(wave => {
                      const isSelected = (activeLayer.oscillatorType || 'sine') === wave.id;
                      return (
                        <button
                          key={wave.id}
                          onClick={() => handleSynthChange('oscillatorType', wave.id)}
                          className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer text-center ${
                            isSelected 
                              ? 'border-transparent text-white font-bold' 
                              : 'glass-gloss text-slate-400 hover:text-slate-200 active:scale-95'
                          }`}
                          style={isSelected ? { backgroundColor: currentTheme.color } : {}}
                        >
                          {wave.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-white/[0.06]" />

            {/* Filter Section */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Per-Track Lowpass Filter</h4>
              {[
                { param: 'cutoff', label: 'Cutoff Frequency', min: 80, max: 20000, step: 10, unit: 'Hz' },
                { param: 'resonance', label: 'Q Resonance', min: 0.1, max: 12, step: 0.1, unit: '' }
              ].map(sld => {
                const val = activeLayer[sld.param] ?? (sld.param === 'cutoff' ? 20000 : 1);
                return (
                  <div key={sld.param} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-300">{sld.label}</span>
                      <span className="font-bold text-white tabular-nums">
                        {val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}{sld.unit}
                      </span>
                    </div>
                    <div className="relative flex items-center h-6 select-none group">
                      <input 
                        type="range" min={sld.min} max={sld.max} step={sld.step}
                        value={val}
                        onChange={(e) => handleSynthChange(sld.param, Number(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MIDI SMART TOOLS */}
        {activeTab === 'midi' && (
          <div className="space-y-6">
            <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Quantization & Playback</h3>
              <p className="text-[9px] text-slate-400">Apply non-destructive real-time effects or snap drawn notes for <span className="font-bold" style={{ color: activeLayer.color }}>{activeLayer.name}</span>.</p>
            </div>

            {/* Time Quantization */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Quantize Grid (Time)</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Quarter', size: 4 },
                  { label: '8th Note', size: 2 },
                  { label: '16th Note', size: 1 }
                ].map(div => (
                  <button
                    key={div.label}
                    onClick={() => quantizeTime(div.size)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl glass-gloss transition-all cursor-pointer text-center text-slate-200 hover:text-white"
                  >
                    <Disc className="w-4 h-4 text-slate-400 mb-1" />
                    <span className="text-[9px] font-black">{div.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Pitch Quantization */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Quantize Pitch (Scale Snapping)</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SCALES).map(([key, scale]) => (
                  <button
                    key={key}
                    onClick={() => quantizePitch(key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass-gloss transition-all cursor-pointer text-left text-slate-200 hover:text-white"
                  >
                    <Music className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold truncate">{scale.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Playback Settings (Humanize) */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Humanization</h4>
              
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-black text-white">Live Humanize</span>
                  <span className="text-[9px] text-slate-400">Slight timing & volume fluctuations.</span>
                </div>
                <button
                  onClick={() => handleSynthChange('humanize', !activeLayer.humanize)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    activeLayer.humanize ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    activeLayer.humanize ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <button
                onClick={applyHumanizeNotes}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Randomize Notes (Destructive)
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: PRESETS LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            <div className="space-y-1 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Presets Library</h3>
              <p className="text-[9px] text-slate-400">Instantly populate <span className="font-bold text-indigo-300">{activeLayer.name}</span> with drum beats or chord progressions.</p>
            </div>

            {/* Chord presets */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Chord Progressions</h4>
              <div className="space-y-2">
                {CHORD_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => loadPresetChords(preset)}
                    className="w-full flex items-center justify-between p-3 rounded-xl glass-gloss transition-all cursor-pointer group text-left"
                  >
                    <div>
                      <span className="text-[11px] font-black text-white block leading-none">{preset.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-1.5">{preset.description}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Drum presets */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Drum Grooves (Use with Studio Kit)</h4>
              <div className="space-y-2">
                {DRUM_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => loadPresetDrums(preset)}
                    className="w-full flex items-center justify-between p-3 rounded-xl glass-gloss transition-all cursor-pointer group text-left"
                  >
                    <div>
                      <span className="text-[11px] font-black text-white block leading-none">{preset.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-1.5">{preset.description}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>
    </motion.div>
  );
}
