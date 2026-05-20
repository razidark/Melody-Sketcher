import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Music, 
  MousePointer, 
  Sliders, 
  Keyboard, 
  Sparkles
} from 'lucide-react';

const GUIDE_SLIDES = [
  {
    title: 'Welcome to Melody Sketcher',
    description: 'A high-fidelity digital audio workstation right in your browser. Sketch melodies, compose loops, customize synths, and export CD-quality WAV files.',
    icon: Music,
    color: '#3b82f6',
    component: (theme) => (
      <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.secondary || '#3b82f6'})` }}>
          <Music className="w-8 h-8 text-white relative z-10" />
        </div>
        <span className="text-[12px] font-black tracking-widest text-slate-400 uppercase">Interactive Studio Guide</span>
      </div>
    )
  },
  {
    title: 'Drawing Notes',
    description: 'Use the sequencer canvas to paint notes. Double-click or click-drag to add notes. Right-click or double-tap to erase them.',
    icon: MousePointer,
    color: '#ff2e93',
    component: () => (
      <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl w-full">
        <div className="h-28 w-full bg-black/40 rounded-xl relative overflow-hidden border border-white/10 flex items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-white/40" />
            ))}
          </div>
          <div className="w-14 h-6 rounded-lg bg-pink-500 shadow-[0_0_15px_rgba(244,114,182,0.6)] flex items-center justify-center text-[10px] font-black text-white relative -translate-x-8">
            C4
          </div>
          <div className="w-14 h-6 rounded-lg bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center text-[10px] font-black text-white relative translate-x-8 translate-y-4">
            E4
          </div>
          <div className="absolute text-[9px] font-bold text-slate-500 bottom-2 right-2">Click-Drag to Paint</div>
        </div>
      </div>
    )
  },
  {
    title: 'Live QWERTY Playback',
    description: 'No physical MIDI keyboard? No problem! Use your computer keyboard rows (A, W, S, E, D, F...) to audition instruments and record live in real-time.',
    icon: Keyboard,
    color: '#22ff80',
    component: () => (
      <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl w-full">
        <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold text-center">QWERTY Keyboard Map</div>
        <div className="flex justify-center gap-1.5 mt-2">
          {['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G'].map((k, i) => (
            <div 
              key={k} 
              className={`w-8 h-10 rounded-lg flex flex-col items-center justify-between py-1.5 border font-black text-[10px] ${
                ['W', 'E', 'T'].includes(k) 
                  ? 'bg-black border-white/20 text-white shadow-md' 
                  : 'bg-white border-white/40 text-black'
              }`}
            >
              <span>{k}</span>
              <span className="text-[7px] opacity-60 font-bold">{['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: 'Multitrack Mixing',
    description: 'Use the bottom tabs to manage multiple tracks. Use the Mixer (left fader icon) to set track levels, pan parameters, and toggle Mute or Solo controls.',
    icon: Sliders,
    color: '#a78bfa',
    component: () => (
      <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl w-full">
        <div className="h-28 w-full bg-black/40 rounded-xl relative p-3 border border-white/10 flex items-center justify-around">
          {[1, 2].map(t => (
            <div key={t} className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-slate-400">TRACK {t}</span>
              <div className="w-1.5 h-16 bg-white/10 rounded-full relative flex items-end">
                <div className="w-full h-10 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <div className="absolute w-3.5 h-3.5 rounded-full bg-white border border-slate-500 bottom-8 -left-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: 'Smart MIDI Tools & Synth Editor',
    description: 'Use the new Studio Dashboard (Sliders icon in the header) to open advanced pitch scale quantizing, grid time snapping, drum beat templates, and visual HSL theme designers.',
    icon: Sparkles,
    color: '#ffc300',
    component: () => (
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="flex flex-col items-center justify-center p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
          <Sliders className="w-5 h-5 text-purple-400 mb-1.5" />
          <span className="text-[10px] font-black text-white">ADSR Synth</span>
          <span className="text-[8px] text-slate-400 mt-1">Sculpt Envelopes</span>
        </div>
        <div className="flex flex-col items-center justify-center p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
          <Sparkles className="w-5 h-5 text-amber-400 mb-1.5" />
          <span className="text-[10px] font-black text-white">MIDI Snapper</span>
          <span className="text-[8px] text-slate-400 mt-1">Snap Pitch & Time</span>
        </div>
      </div>
    )
  }
];

export default function InteractiveGuide({
  currentTheme,
  closeGuide
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < GUIDE_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      closeGuide();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const activeSlide = GUIDE_SLIDES[currentSlide];
  const Icon = activeSlide.icon;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-[500px] bg-black/60 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.85)] relative"
      >
        {/* Top glossy reflection */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Close Button */}
        <button
          onClick={closeGuide}
          className="absolute right-6 top-6 w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white cursor-pointer hover:bg-white/[0.06] active:scale-90 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Slide Content */}
        <div className="p-8 flex-1 flex flex-col items-center text-center gap-6 mt-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative shadow-lg"
            style={{ 
              background: `rgba(255,255,255,0.03)`, 
              border: `1px solid ${activeSlide.color}40`,
              boxShadow: `0 0 25px ${activeSlide.color}15`
            }}
          >
            <Icon className="w-8 h-8" style={{ color: activeSlide.color }} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-wide text-white uppercase">{activeSlide.title}</h2>
            <p className="text-[12px] text-slate-400 font-bold leading-relaxed px-4">{activeSlide.description}</p>
          </div>

          {/* Interactive component for visual reinforcement */}
          <div className="w-full mt-2">
            {activeSlide.component(currentTheme)}
          </div>
        </div>

        {/* Slide Indicators & Navigation Footer */}
        <div className="px-8 py-5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              currentSlide === 0 
                ? 'opacity-30 border-transparent text-slate-600 cursor-not-allowed' 
                : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:text-white hover:border-white/10 active:scale-95'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          {/* Indicators */}
          <div className="flex gap-2">
            {GUIDE_SLIDES.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'w-5 bg-white' : 'w-1.5 bg-white/20'
                }`}
                style={currentSlide === i ? { backgroundColor: currentTheme.color } : {}}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black hover:scale-105 active:scale-95 transition-all cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.color}, ${currentTheme.secondary || '#3b82f6'})`,
              color: '#ffffff'
            }}
          >
            {currentSlide === GUIDE_SLIDES.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
