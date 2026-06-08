import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Sparkles, Music } from 'lucide-react';
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

const FLAGSHIP_IDS = [
  'acoustic-piano', 'electric-piano', 'lofi-keys', 'marimba', 'org', 
  'nylon-guitar', 'electric-guitar', 'slap-bass', 'synth-bass', '808-bass', 
  'strings', 'choral', 'brass', 'flute', 'pulse', 'synth-lead', 'fm', 
  'synth-pad', 'bells', 'drum-kit'
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
  const [searchQuery, setSearchQuery] = useState('');

  // First filter by tab and search query
  const matchesSearch = (inst) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return inst.name.toLowerCase().includes(query) || inst.category.toLowerCase().includes(query);
  };

  const baseFiltered = INSTRUMENTS.filter(inst => {
    const matchesTab = activeTab === 'all' || getTabIdForInstrument(inst) === activeTab;
    return matchesTab && matchesSearch(inst);
  });

  // Segmentize into Flagship and Classic MIDI
  const flagshipInstruments = baseFiltered.filter(inst => FLAGSHIP_IDS.includes(inst.id));
  const classicInstruments = baseFiltered.filter(inst => !FLAGSHIP_IDS.includes(inst.id));

  return (
    <motion.div 
      initial={{ y: -30, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -30, opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="absolute left-1/2 -translate-x-1/2 top-24 w-[900px] max-w-[95vw] z-50 rounded-[32px] overflow-hidden border"
      style={{
        background: 'rgba(5, 5, 8, 0.88)',
        backdropFilter: 'blur(40px) saturate(240%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: `0 40px 100px rgba(0,0,0,0.95), inset 0 1px 0 0 rgba(255,255,255,0.15), inset -2px 0 8px rgba(0,240,255,0.15), inset 2px 0 8px rgba(46,255,147,0.15), 0 0 40px -10px ${currentTheme.color}30`
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-10 pt-8 pb-4 gap-4">
        <div>
          <h4 className="text-[14px] font-black uppercase tracking-[0.25em]" style={{ color: currentTheme.color, textShadow: `0 0 12px ${currentTheme.color}80` }}>
            Instrument Library
          </h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
            Configure voicing for active track ({baseFiltered.length} of {INSTRUMENTS.length} items)
          </span>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search all 129 instruments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-2.5 rounded-2xl glass-gloss text-[11px] font-extrabold tracking-wide text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 border border-white/[0.05]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button 
          onClick={closeMenu} 
          className="absolute sm:relative right-6 sm:right-0 top-6 sm:top-0 w-10 h-10 rounded-2xl glass-gloss flex items-center justify-center transition-all text-slate-400 hover:text-white cursor-pointer active:scale-90"
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
              ${activeTab !== tab.id 
                ? 'glass-gloss text-slate-400 hover:text-white' 
                : ''
              }`}
            style={{
              background: activeTab === tab.id ? `linear-gradient(135deg, ${currentTheme.color}, #6366f1)` : '',
              color: activeTab === tab.id ? '#ffffff' : '',
              borderColor: activeTab === tab.id ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              boxShadow: activeTab === tab.id ? `0 0 15px ${currentTheme.color}40` : ''
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Scrollable Container with Segments */}
      <div className="px-8 py-6 max-h-[52vh] overflow-y-auto scrollbar-studio flex flex-col gap-6">
        
        {/* SECTION 1: Flagship Studio Sounds */}
        {flagshipInstruments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3.5 px-1">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                Flagship Studio Sounds
              </h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {flagshipInstruments.map(inst => {
                const isSelected = currentInstrument.id === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => { setCurrentInstrument(inst); closeMenu(); }}
                    className={`flex items-center p-4 rounded-2xl transition-all duration-300 gap-4 group relative text-left cursor-pointer hover:scale-[1.02] active:scale-95 border
                      ${isSelected 
                        ? 'bg-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
                        : 'glass-gloss'
                      }
                    `}
                    style={{
                      borderColor: isSelected ? currentTheme.color : 'rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected ? `0 0 15px ${currentTheme.color}30, inset 0 1px 0 0 rgba(255,255,255,0.08)` : ''
                    }}
                  >
                    {!isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
                    )}
                    
                    <div 
                      className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? '' : 'opacity-85 group-hover:opacity-100'}`}
                      style={{ color: isSelected ? currentTheme.color : '#ffffff' }}
                    >
                      {inst.icon && typeof inst.icon !== 'string' ? (
                        <inst.icon size={28} strokeWidth={1.5} />
                      ) : (
                        <span className="text-3xl">{inst.icon}</span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p 
                          className="text-[13px] font-black uppercase tracking-wider leading-tight truncate text-slate-100"
                          style={{ textShadow: isSelected ? `0 0 10px ${currentTheme.color}50` : 'none' }}
                        >
                          {inst.name}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-white/10 text-slate-300">
                          HD
                        </span>
                      </div>
                      <p className="text-[10px] font-extrabold tracking-widest uppercase mt-1 text-slate-400">
                        {inst.category}
                      </p>
                    </div>

                    {isSelected && (
                      <div 
                        className="absolute right-5 w-2 h-2 rounded-full" 
                        style={{ 
                          backgroundColor: currentTheme.color,
                          boxShadow: `0 0 8px ${currentTheme.color}` 
                        }} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: Classic General MIDI Voices */}
        {classicInstruments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3.5 px-1">
              <Music className="w-4 h-4 text-slate-400" />
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Classic MIDI Library
              </h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {classicInstruments.map(inst => {
                const isSelected = currentInstrument.id === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => { setCurrentInstrument(inst); closeMenu(); }}
                    className={`flex items-center p-3.5 rounded-2xl transition-all duration-300 gap-4 group relative text-left cursor-pointer hover:scale-[1.02] active:scale-95 border
                      ${isSelected 
                        ? 'bg-white/[0.05] shadow-[0_4px_16px_rgba(0,0,0,0.3)]' 
                        : 'glass-gloss opacity-80 hover:opacity-100'
                      }
                    `}
                    style={{
                      borderColor: isSelected ? currentTheme.color : 'rgba(255,255,255,0.04)',
                      boxShadow: isSelected ? `0 0 10px ${currentTheme.color}20, inset 0 1px 0 0 rgba(255,255,255,0.05)` : ''
                    }}
                  >
                    <div 
                      className={`transition-transform duration-300 group-hover:scale-105 ${isSelected ? '' : 'opacity-60 group-hover:opacity-100'}`}
                      style={{ color: isSelected ? currentTheme.color : '#cbd5e1' }}
                    >
                      {inst.icon && typeof inst.icon !== 'string' ? (
                        <inst.icon size={22} strokeWidth={1.5} />
                      ) : (
                        <span className="text-2xl">{inst.icon}</span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p 
                        className="text-[12px] font-bold uppercase tracking-wider leading-tight truncate text-slate-200"
                        style={{ textShadow: isSelected ? `0 0 8px ${currentTheme.color}40` : 'none' }}
                      >
                        {inst.name}
                      </p>
                      <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 text-slate-500">
                        {inst.category}
                      </p>
                    </div>

                    {isSelected && (
                      <div 
                        className="absolute right-4 w-1.5 h-1.5 rounded-full" 
                        style={{ 
                          backgroundColor: currentTheme.color,
                          boxShadow: `0 0 6px ${currentTheme.color}` 
                        }} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {baseFiltered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
            <Search className="w-8 h-8 opacity-40 animate-bounce" />
            <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">
              No instruments match your search
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="px-4 py-2 mt-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white cursor-pointer active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </motion.div>
  );
}

