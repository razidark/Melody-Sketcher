import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { INSTRUMENTS } from '../constants/midiConstants';

const TABS = [
  { id: 'all', name: 'All' },
  { id: 'keys', name: 'Keys & Organs' },
  { id: 'strings', name: 'Strings & Brass' },
  { id: 'guitars', name: 'Guitars & Basses' },
  { id: 'synths', name: 'Synths & Pads' },
  { id: 'drums', name: 'Drums & Perc' },
  { id: 'fx', name: 'FX & Ethnic' }
];

const getTabIdForInstrument = (inst) => {
  const cat = inst.category;
  if (cat === 'Pianos' || cat === 'Organs') return 'keys';
  if (cat === 'Guitars' || cat === 'Basses') return 'guitars';
  if (cat === 'Strings' || cat === 'Ensembles' || cat === 'Brass' || cat === 'Reeds' || cat === 'Pipes') return 'strings';
  if (cat === 'Leads' || cat === 'Pads') return 'synths';
  if (cat === 'Percussion' || cat === 'Percussive' || cat === 'Drums') return 'drums';
  return 'fx'; // Synth FX, Ethnic, Sound Effects
};

export default function InstrumentSelector({
  currentInstrument,
  setCurrentInstrument,
  currentTheme,
  closeMenu
}) {
  const [activeTab, setActiveTab] = useState('all');

  const filteredInstruments = activeTab === 'all'
    ? INSTRUMENTS
    : INSTRUMENTS.filter(inst => getTabIdForInstrument(inst) === activeTab);

  return (
    <motion.div 
      initial={{ y: -30, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -30, opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="absolute left-1/2 -translate-x-1/2 top-24 w-[840px] max-w-[95vw] z-50 rounded-[32px] overflow-hidden border"
      style={{
        background: 'rgba(15, 15, 25, 0.65)',
        backdropFilter: 'blur(35px) saturate(220%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 0 rgba(255,255,255,0.15), inset -2px 0 8px rgba(0,240,255,0.12), inset 2px 0 8px rgba(255,46,147,0.12), 0 0 40px -10px ${currentTheme.color}20`
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-10 pt-8 pb-4">
        <div>
          <h4 className="text-[14px] font-black uppercase tracking-[0.25em]" style={{ color: currentTheme.color, textShadow: `0 0 12px ${currentTheme.color}80` }}>
            Instrument Library
          </h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            Select voicing for active track ({filteredInstruments.length} items)
          </span>
        </div>
        <button 
          onClick={closeMenu} 
          className="w-10 h-10 rounded-2xl hover:bg-white/10 flex items-center justify-center transition-all text-slate-400 hover:text-white cursor-pointer border border-white/5 hover:border-white/20 active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 px-8 pb-4 overflow-x-auto scrollbar-none border-b border-white/[0.04]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer whitespace-nowrap border shadow-sm hover:scale-[1.02] active:scale-95
              ${activeTab === tab.id 
                ? 'bg-white text-black border-white' 
                : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:text-white hover:border-white/15'
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[50vh] overflow-y-auto scrollbar-studio">
        {filteredInstruments.map(inst => {
          const isSelected = currentInstrument.id === inst.id;
          return (
            <button
              key={inst.id}
              onClick={() => { setCurrentInstrument(inst); closeMenu(); }}
              className={`flex items-center p-4 rounded-2xl border transition-all duration-300 gap-4 group relative text-left cursor-pointer hover:scale-[1.02] active:scale-95 shadow-sm
                ${isSelected 
                  ? 'bg-white border-white shadow-[0_4px_24px_rgba(255,255,255,0.25)]' 
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20'
                }
              `}
            >
              {/* Glass sheen overlay for non-selected */}
              {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
              )}
              
              <div className={`text-3xl transition-transform duration-300 group-hover:scale-110 ${isSelected ? '' : 'opacity-70 group-hover:opacity-100'}`}>
                {inst.icon}
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-bold uppercase tracking-wider leading-tight truncate ${isSelected ? 'text-black' : 'text-slate-100'}`}>
                  {inst.name}
                </p>
                <p className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
                  {inst.category}
                </p>
              </div>
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black shadow-inner" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
