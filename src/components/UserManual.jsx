import { motion } from 'framer-motion';
import { X, BookOpen, Music, Sliders, Keyboard, Settings, Table } from 'lucide-react';

const MANUAL_SECTIONS = [
  {
    id: 'intro',
    title: 'Welcome to the Studio',
    icon: Music,
    content: `Melody Sketcher is a premium browser-based Digital Audio Workstation (DAW) designed for rapid musical sketching. By combining traditional piano roll sequencing, modular synthesizer engines, real-time FX, and smart MIDI tools, it enables you to compose loops and render CD-quality master audio directly in your browser.`
  },
  {
    id: 'sequencing',
    title: 'Drawing & Editing Notes',
    icon: Sliders,
    content: `• Painting Notes: Double-click or click-and-drag on the grids to draw new notes. 
• Erasing Notes: Double-click or right-click any existing note block to remove it.
• Customizing Pitch: Vertical positions represent note frequencies (e.g., C4, D#4). 
• Customizing Time: Horizontal positions represent timeline ticks (1 beat = 4 ticks).`
  },
  {
    id: 'performance',
    title: 'QWERTY Playback & Recording',
    icon: Keyboard,
    content: `You can use your computer QWERTY keyboard to play notes in real time.
• White Keys (Natural Notes): A (C4), S (D4), D (E4), F (F4), G (G4), H (A4), J (B4), K (C5), L (D5), Semicolon (E5), Quote (F5).
• Black Keys (Accidental Notes): W (C#4), E (D#4), T (F#4), Y (G#4), U (A#4), O (C#5), P (D#5).
• Step Recording: Toggle Record (Red Circle), then press QWERTY keys to input notes sequentially at the active playhead position. Press Left/Right arrow keys to scrub steps.`
  },
  {
    id: 'synth',
    title: 'Synth Customizer & ADSR',
    icon: Settings,
    content: `Open the Studio Dashboard (Sliders icon in the header) to access the synthesizer's envelope controls:
• Attack: Time taken for the note to reach full volume (0s for instant bite, longer for pads).
• Decay: Time taken for the note to fall to the sustain volume level.
• Sustain: The volume level at which the note is held while a key is pressed.
• Release: Time taken for the note sound to fade away after releasing the key.
• Lowpass Filter: Frequency cutoff slides from 20Hz (muffled) to 20,000Hz (bright). Resonance adds emphasis around the cutoff frequency.
• Oscillator Waveform: Toggle between Sine, Triangle, Sawtooth, and Square carrier waves in real time to redefine the primary sound texture.`
  },
  {
    id: 'shortcuts',
    title: 'Workstation Keyboard Shortcuts',
    icon: Table,
    content: `Control the DAW at lightspeed using your keyboard keys:
• Spacebar: Toggle Playback / Stop
• Escape: Close all open panels
• Q: Toggle Studio Dashboard Panel
• M: Toggle Mixer Console Faders
• X: Toggle Master FX Strip (Reverb, Delay, Distortion)
• R: Toggle Metronome clicks
• N / V: Switch between Studio Grid and Stage View
• Digit 1 to 9: Select active Track Layer 1 through 9
• Arrow Left / Right: Scrub timeline playhead backward or forward
• Arrow Up / Down: Adjust master tempo (BPM) up or down by 5 BPM`
  }
];

export default function UserManual({ onClose }) {
  return (
    <div className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-[640px] h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.9)] relative"
      >
        {/* Top Gloss Reflector */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Header Header */}
        <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">DAW User Manual</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 1.0 • Technical Reference Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white cursor-pointer hover:bg-white/[0.06] active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {MANUAL_SECTIONS.map((sect) => {
            const Icon = sect.icon;
            return (
              <div key={sect.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">{sect.title}</h3>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-bold whitespace-pre-line pl-6">
                  {sect.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white/[0.01] border-t border-white/[0.06] flex items-center justify-between text-[9px] text-slate-500 font-black uppercase tracking-widest">
          <span>© 2026 Melody Sketcher</span>
          <span>Press ESC to dismiss</span>
        </div>
      </motion.div>
    </div>
  );
}
