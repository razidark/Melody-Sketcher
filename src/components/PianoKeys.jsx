import { forwardRef } from 'react';
import { 
  ALL_NOTES, 
  NOTE_TO_KEY_LABEL 
} from '../constants/midiConstants';

const PianoKeys = forwardRef(function PianoKeys({
  viewMode,
  activeKeys,
  playNoteForKeyboard,
  activeLayer,
  ROW_HEIGHT
}, ref) {
  if (viewMode !== 'studio') return null;

  return (
    <div ref={ref} className="w-22 bg-black/60 backdrop-blur-3xl border-r border-white/[0.08] overflow-y-hidden select-none z-40 flex flex-col items-end shadow-[inset_-1px_0_12px_rgba(255,255,255,0.03)]">
      {ALL_NOTES.map((note) => {
        const isSharp = note.name.includes('#');
        const isC = note.name.startsWith('C') && !isSharp;
        const isActive = activeKeys[note.name];
        
        const activeColor = typeof isActive === 'string' ? isActive : activeLayer.color;

        return (
          <div 
            key={note.name}
            onPointerDown={() => {
              playNoteForKeyboard(note.name);
            }}
            className={`flex items-center justify-between px-2 text-[10px] font-bold border-b border-white/[0.04] transition-all duration-75 relative cursor-pointer
              ${isActive 
                ? 'text-black font-black z-10'
                : isSharp 
                  ? 'w-[84%] bg-gradient-to-r from-[#141418] to-[#0a0a0c] text-slate-500 hover:text-slate-200 hover:from-[#1c1c22] rounded-l-md border-l border-y border-white/[0.06] shadow-md' 
                  : 'w-full bg-gradient-to-r from-white/[0.02] to-transparent text-slate-400 hover:text-slate-100 hover:from-white/[0.06]'}
            `}
            style={{
              height: `${ROW_HEIGHT}px`,
              background: isActive 
                ? `linear-gradient(90deg, ${activeColor} 0%, rgba(255,255,255,0.9) 100%)` 
                : undefined,
              boxShadow: isActive 
                ? `0 0 20px ${activeColor}a0, inset -3px 0 6px rgba(255,255,255,0.6)` 
                : undefined,
              transform: isActive ? 'scaleX(1.04) scaleY(1.06)' : 'none',
              transformOrigin: 'right center'
            }}
          >
            {isC && !isActive && (
              <div className="absolute inset-y-0 left-0 w-[4px] bg-indigo-500/30 rounded-r shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            )}
            
            <div className={`transition-colors flex items-end gap-0.5 relative z-10 ${isC && !isActive ? 'text-indigo-300 scale-105 ml-1.5' : 'ml-1.5'}`}>
              <span className="leading-none">{note.name.slice(0, -1)}</span>
              <span className={`text-[8px] leading-none mb-[1px] ${isActive ? 'opacity-80' : 'opacity-40'}`}>{note.name.slice(-1)}</span>
            </div>

            {/* QWERTY overlay bubble */}
            {NOTE_TO_KEY_LABEL[note.name] && !isActive && (
              <span className={`text-[8px] font-black rounded px-1.5 py-0.5 pointer-events-none transition-all shadow-sm leading-none
                ${isSharp ? 'bg-white/5 text-slate-500 border border-white/5' : 'bg-white/10 text-slate-400 border border-white/10'}
              `}>
                {NOTE_TO_KEY_LABEL[note.name]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default PianoKeys;
