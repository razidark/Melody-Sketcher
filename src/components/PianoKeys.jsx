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
    <div ref={ref} className="w-24 bg-black/60 backdrop-blur-3xl border-r border-white/[0.08] overflow-y-hidden select-none z-40 shadow-[inset_-1px_0_12px_rgba(255,255,255,0.03)]">
      <div className="relative w-full" style={{ height: `${ALL_NOTES.length * ROW_HEIGHT + 24}px` }}>
        {/* 24px spacer to align with the timeline ruler in SequencerCanvas */}
        <div className="absolute top-0 left-0 h-6 w-full bg-black/40 border-b border-white/[0.08] z-30 pointer-events-none" />
        
        {ALL_NOTES.map((note, i) => {
          const isSharp = note.name.includes('#');
          const isC = note.name.startsWith('C') && !isSharp;
          const isActive = activeKeys[note.name];
          const keyLabel = NOTE_TO_KEY_LABEL[note.name];
          
          const activeColor = typeof isActive === 'string' ? isActive : activeLayer.color;
   
          return (
            <div 
              key={note.name}
              onPointerDown={() => {
                playNoteForKeyboard(note.name);
              }}
              className={`flex items-center justify-between px-2 text-[10px] font-bold border-b border-black/[0.12] transition-all duration-75 absolute right-0 cursor-pointer group
                ${isActive 
                  ? 'text-white font-black z-10'
                  : isSharp 
                    ? 'w-[72%] bg-gradient-to-r from-[#0a0a0c] to-[#030304] text-slate-400 hover:text-slate-100 hover:from-[#121217] rounded-l border-l border-y border-black/60 shadow-lg z-20' 
                    : 'w-full bg-gradient-to-r from-[#1c1c22] to-[#0e0e12] text-slate-400 hover:from-[#2a2a33] hover:to-[#14141a] border-r border-white/[0.03]'}
              `}
              style={{
                top: `${24 + i * ROW_HEIGHT}px`,
                height: `${ROW_HEIGHT}px`,
                background: isActive 
                  ? `linear-gradient(90deg, ${activeColor} 0%, rgba(255, 255, 255, 0.4) 100%)` 
                  : undefined,
                boxShadow: isActive 
                  ? `0 0 20px ${activeColor}90, inset -3px 0 6px rgba(255, 255, 255, 0.2)` 
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

              {keyLabel && (
                <span className="text-[7.5px] font-black opacity-45 group-hover:opacity-90 uppercase bg-white/10 px-1 py-0.5 rounded select-none text-slate-300 transition-opacity relative z-10">
                  {keyLabel}
                </span>
              )}
  
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PianoKeys;
