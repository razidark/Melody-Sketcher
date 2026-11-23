import { motion } from 'framer-motion';
import { X, BookOpen, Music, Sliders, Keyboard, Settings, Table, Gamepad2, Info } from 'lucide-react';

const MANUAL_SECTIONS = [
  {
    id: 'intro',
    title: 'Welcome to the Studio',
    icon: Music,
    accent: '#00f0ff',
    type: 'text',
    content: 'Melody Sketcher is a high-fidelity browser-based Digital Audio Workstation (DAW) designed for rapid musical sketching. By combining traditional piano roll sequencing, modular synthesizer engines, real-time FX, and smart MIDI tools, it enables you to compose loops and render CD-quality master audio directly in your browser.'
  },
  {
    id: 'sequencing',
    title: 'Drawing & Editing Notes',
    icon: Sliders,
    accent: '#2ebd59',
    type: 'list',
    items: [
      { label: 'Painting Notes', text: 'Double-click or click-and-drag on the grids to draw new notes.' },
      { label: 'Erasing Notes', text: 'Double-click or right-click any existing note block to remove it.' },
      { label: 'Customizing Pitch', text: 'Vertical positions represent note frequencies (e.g., C4, D#4).' },
      { label: 'Customizing Time', text: 'Horizontal positions represent timeline ticks (1 beat = 4 ticks).' }
    ]
  },
  {
    id: 'performance',
    title: 'QWERTY Playback & Recording',
    icon: Keyboard,
    accent: '#ff3366',
    type: 'performance',
    description: 'Play melodies live or record notes directly from your computer keyboard:',
    groups: [
      {
        name: 'White Keys (Natural Notes)',
        keys: [
          { key: 'A', note: 'C4' }, { key: 'S', note: 'D4' }, { key: 'D', note: 'E4' },
          { key: 'F', note: 'F4' }, { key: 'G', note: 'G4' }, { key: 'H', note: 'A4' },
          { key: 'J', note: 'B4' }, { key: 'K', note: 'C5' }, { key: 'L', note: 'D5' },
          { key: ';', note: 'E5' }, { key: "'", note: 'F5' }
        ]
      },
      {
        name: 'Black Keys (Accidental Notes)',
        keys: [
          { key: 'W', note: 'C#4' }, { key: 'E', note: 'D#4' }, { key: 'T', note: 'F#4' },
          { key: 'Y', note: 'G#4' }, { key: 'U', note: 'A#4' }, { key: 'O', note: 'C#5' },
          { key: 'P', note: 'D#5' }
        ]
      }
    ],
    recording: 'Step Recording: Toggle Record (Red Circle), then press QWERTY keys to input notes sequentially at the active playhead position. Press Left/Right arrows to scrub steps.'
  },
  {
    id: 'synth',
    title: 'Synth Customizer & ADSR',
    icon: Settings,
    accent: '#ff9f43',
    type: 'list',
    description: "Open the Studio Dashboard (Sliders icon in the header) to access the synthesizer's envelope controls:",
    items: [
      { label: 'Attack', text: 'Time taken for the note to reach full volume (0s for instant bite, longer for pads).' },
      { label: 'Decay', text: 'Time taken for the note to fall to the sustain volume level.' },
      { label: 'Sustain', text: 'The volume level at which the note is held while a key is pressed.' },
      { label: 'Release', text: 'Time taken for the note sound to fade away after releasing the key.' },
      { label: 'Lowpass Filter', text: 'Frequency cutoff slides from 20Hz (muffled) to 20,000Hz (bright). Resonance adds emphasis.' },
      { label: 'Oscillator Waveform', text: 'Toggle between Sine, Triangle, Sawtooth, and Square carrier waves in real time.' }
    ]
  },
  {
    id: 'shortcuts',
    title: 'Workstation Keyboard Shortcuts',
    icon: Table,
    accent: '#3a86ff',
    type: 'shortcuts',
    items: [
      { key: 'Spacebar', desc: 'Toggle Playback / Stop' },
      { key: 'Escape', desc: 'Close all open panels / modals' },
      { key: 'Q', desc: 'Toggle Studio Dashboard' },
      { key: 'M', desc: 'Toggle Mixer Console Faders' },
      { key: 'X', desc: 'Toggle Master FX Strip' },
      { key: 'R', desc: 'Toggle Metronome clicks' },
      { key: 'N / V', desc: 'Switch Grid / Stage View' },
      { key: '1 - 9', desc: 'Select active Track Layer' },
      { key: '← / →', desc: 'Scrub timeline playhead' },
      { key: '↑ / ↓', desc: 'Adjust tempo by 5 BPM' }
    ]
  },
  {
    id: 'gamepad',
    title: 'Gamepad & Joystick Integration',
    icon: Gamepad2,
    accent: '#8b5cf6',
    type: 'gamepad',
    description: 'Plug in any USB or Bluetooth game controller (Xbox, PS, Switch, or PC gamepad) for direct control:',
    items: [
      { control: 'Left Joystick / D-Pad', desc: 'Move the glowing sequencer cursor grid highlights.' },
      { control: 'Right Joystick (Up/Down)', desc: 'Tweak Active Track Volume dynamically.' },
      { control: 'Right Joystick (Left/Right)', desc: 'Tweak Active Track Panning dynamically.' },
      { control: 'Button A / Cross', desc: 'Place a note at the current cursor cell position.' },
      { control: 'Button B / Circle', desc: 'Erase the note at the current cursor cell position.' },
      { control: 'Button X / Square', desc: 'Start or stop project playback (Play/Stop).' },
      { control: 'Button Y / Triangle', desc: 'Start or stop project recording (Record).' },
      { control: 'Bumper Left (LB/L1)', desc: 'Switch to previous track layer.' },
      { control: 'Bumper Right (RB/R1)', desc: 'Switch to next track layer.' },
      { control: 'Triggers (LT/RT)', desc: 'Rewind or forward timeline by 10 seconds.' },
      { control: 'Select / Start', desc: 'Undo or Redo note composition steps.' }
    ]
  }
];

export default function UserManual({ onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Overlay backdrop closing */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-[680px] h-[80vh] rounded-xl overflow-hidden flex flex-col relative rainbow-wrapper"
        style={{
          padding: '2px', // The 2px padding forms the animated rainbow border around our inner container
        }}
      >
        {/* Inner solid content wrapper */}
        <div className="w-full h-full rounded-xl bg-[#050508]/95 backdrop-blur-2xl flex flex-col overflow-hidden relative">
          
          {/* Subtle Cyber Grid Background overlay */}
          <div className="absolute inset-0 bg-zinc-950/10 pointer-events-none z-0"
               style={{
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
                 backgroundSize: '24px 24px'
               }}
          />

          {/* Header Panel */}
          <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between bg-zinc-950/80 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-[13px] font-black uppercase tracking-[0.15em] text-white">DAW User Manual</h2>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                  Version 1.0 • Complete Technical Reference
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center glass-gloss text-slate-400 hover:text-white cursor-pointer hover:bg-white/[0.06] active:scale-90 transition-all border border-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-studio relative z-10 bg-zinc-950/30">
            
            {MANUAL_SECTIONS.map((sect) => {
              const Icon = sect.icon;
              return (
                <div key={sect.id} className="space-y-4 bg-white/[0.01] border border-white/[0.03] p-5 rounded-2xl relative overflow-hidden group hover:border-white/[0.07] hover:bg-white/[0.02] transition-all">
                  
                  {/* Left accent color indicator */}
                  <div className="absolute top-0 bottom-0 left-0 w-1" style={{ backgroundColor: sect.accent }} />

                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.04] pl-2">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: sect.accent }} />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200">{sect.title}</h3>
                  </div>

                  <div className="pl-2">
                    {/* TYPE: Plain Text (Welcome) */}
                    {sect.type === 'text' && (
                      <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                        {sect.content}
                      </p>
                    )}

                    {/* TYPE: List (Sequencing / ADSR) */}
                    {sect.type === 'list' && (
                      <div className="space-y-3">
                        {sect.description && (
                          <p className="text-[10px] text-slate-400 font-bold mb-2">{sect.description}</p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sect.items.map((item, i) => (
                            <div key={i} className="p-2.5 bg-black/40 rounded-xl border border-white/[0.03] space-y-1">
                              <span className="text-[9.5px] font-black uppercase tracking-wider block" style={{ color: sect.accent }}>
                                {item.label}
                              </span>
                              <p className="text-[10px] text-slate-400 leading-normal font-semibold">
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TYPE: Performance QWERTY keys */}
                    {sect.type === 'performance' && (
                      <div className="space-y-4">
                        <p className="text-[10px] text-slate-400 font-bold mb-2">{sect.description}</p>
                        
                        {sect.groups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/[0.03]">
                            <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{group.name}</h4>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {group.keys.map((k, kIdx) => (
                                <div key={kIdx} className="flex flex-col items-center justify-center p-1 px-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] min-w-[34px]">
                                  <kbd className="text-[10px] font-black text-white font-mono leading-none">
                                    {k.key}
                                  </kbd>
                                  <span className="text-[7.5px] font-black text-rose-400 uppercase tracking-wider block mt-1 leading-none">
                                    {k.note}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-start gap-3 mt-1">
                          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <p className="text-[9.5px] text-rose-300 leading-relaxed font-bold">
                            {sect.recording}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TYPE: Shortcuts Table */}
                    {sect.type === 'shortcuts' && (
                      <div className="grid grid-cols-2 gap-2">
                        {sect.items.map((shortcut, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-black/45 rounded-xl border border-white/[0.03]">
                            <div className="flex items-center justify-center h-7 px-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_1.5px_0_rgba(0,0,0,0.8)] font-mono text-[9px] font-black text-cyan-400 uppercase min-w-[50px] text-center select-none shrink-0 leading-none">
                              {shortcut.key}
                            </div>
                            <span className="text-[9.5px] text-slate-400 font-bold tracking-wide truncate">
                              {shortcut.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TYPE: Gamepad Controllers */}
                    {sect.type === 'gamepad' && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 font-bold mb-2">{sect.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {sect.items.map((gp, i) => (
                            <div key={i} className="flex items-start gap-3 p-2.5 bg-black/40 rounded-xl border border-white/[0.03]">
                              <span className="text-[8.5px] font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 mt-0.5 leading-none">
                                {gp.control}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold leading-normal">
                                {gp.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-zinc-950 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-slate-500 font-black uppercase tracking-widest relative z-10 shrink-0 select-none">
            <span>© 2026 Melody Sketcher</span>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-md text-slate-400">
              <span>Press ESC to dismiss</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
