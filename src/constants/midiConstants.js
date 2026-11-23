import { 
  Piano, Bell, Speaker, Guitar, Music, Wind, AudioWaveform, 
  Drum, Flame, Zap, Cloud
} from 'lucide-react';

export const NOTES_COUNT = 88; // A0 to C8
export const BASE_ROW_HEIGHT = 24;
export const BASE_BEAT_WIDTH = 48;
export const GRID_SUBDIVISIONS = 4; // 16th notes
export const TICKS_PER_BEAT = 4;

// Note names for 88 keys
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ALL_NOTES = (() => {
  const notes = [];
  for (let i = 0; i <= 8; i++) {
    for (let name of NOTE_NAMES) {
      const note = `${name}${i}`;
      const midi = i * 12 + NOTE_NAMES.indexOf(name) + 12;
      if (midi >= 21 && midi <= 108) { // A0 to C8
        notes.push({ name: note, midi });
      }
    }
  }
  return notes.reverse(); // Highest note at top
})();

export const MIDI_LOOKUP_MAP = (() => {
  const map = new Map();
  ALL_NOTES.forEach((n, idx) => {
    map.set(n.midi, { ...n, index: idx });
  });
  return map;
})();

export const INSTRUMENTS = [
  { id: 'acoustic-grand', name: 'Studio Grand Piano', category: 'Pianos', icon: Piano, gmIndex: 0 },
  { id: 'electric-piano-fm', name: 'FM Rhodes Piano', category: 'Pianos', icon: Piano, gmIndex: 4 },
  { id: 'nylon-guitar', name: 'Nylon Acoustic Guitar', category: 'Guitars', icon: Guitar, gmIndex: 24 },
  { id: 'electric-guitar-clean', name: 'Electric Lead Guitar', category: 'Guitars', icon: Guitar, gmIndex: 27 },
  { id: 'electric-bass', name: 'Precision Bass', category: 'Basses', icon: Speaker, gmIndex: 33 },
  { id: 'synth-bass-sub', name: 'Sub 808 Synth Bass', category: 'Basses', icon: Speaker, gmIndex: 38 },
  { id: 'saw-synth-lead', name: 'Sawtooth Lead Synth', category: 'Leads', icon: Flame, gmIndex: 80 },
  { id: 'square-chiptune-lead', name: '8-Bit Crystal Lead', category: 'Leads', icon: Zap, gmIndex: 81 },
  { id: 'orchestral-strings', name: 'Orchestral Strings', category: 'Strings', icon: Music, gmIndex: 48 },
  { id: 'solo-cello', name: 'Concert Solo Cello', category: 'Strings', icon: Music, gmIndex: 42 },
  { id: 'brass-section', name: 'Brass Ensemble', category: 'Brass', icon: AudioWaveform, gmIndex: 61 },
  { id: 'studio-flute', name: 'Concert Flute', category: 'Pipes', icon: Wind, gmIndex: 73 },
  { id: 'warm-ambient-pad', name: 'Celestial Warm Pad', category: 'Pads', icon: Cloud, gmIndex: 89 },
  { id: 'marimba-percussion', name: 'Studio Marimba', category: 'Percussion', icon: Bell, gmIndex: 12 },
  { id: 'acoustic-drums', name: 'Acoustic Studio Kit', category: 'Drums', icon: Drum, gmIndex: 128 },
  { id: 'drum-kit', name: '808 Electronic Kit', category: 'Drums', icon: Drum, gmIndex: 129 }
];

export const THEMES = [
  { id: 'cyber-prism', name: 'Prismatic Rainbow', color: '#00f0ff', secondary: '#22ff80', isRainbow: true }
];

export const TRACK_COLORS = [
  '#00f0ff', // Electric Cyan
  '#ff3366', // Crimson Prism
  '#22ff80', // Neon Lime
  '#ff9f43', // Golden Amber
  '#3a86ff', // Vivid Sapphire
  '#2ebd59', // Emerald Prism
  '#ff6b6b', // Coral Flame
];

// QWERTY keyboard mappings for live auditioning & recording
export const KEY_TO_NOTE = {
  'KeyA': 'C4',
  'KeyW': 'C#4',
  'KeyS': 'D4',
  'KeyE': 'D#4',
  'KeyD': 'E4',
  'KeyF': 'F4',
  'KeyT': 'F#4',
  'KeyG': 'G4',
  'KeyY': 'G#4',
  'KeyH': 'A4',
  'KeyU': 'A#4',
  'KeyJ': 'B4',
  'KeyK': 'C5',
  'KeyO': 'C#5',
  'KeyL': 'D5',
  'KeyP': 'D#5',
  'Semicolon': 'E5',
  'Quote': 'F5'
};

export const NOTE_TO_KEY_LABEL = {
  'C4': 'A',
  'C#4': 'W',
  'D4': 'S',
  'D#4': 'E',
  'E4': 'D',
  'F4': 'F',
  'F#4': 'T',
  'G4': 'G',
  'G#4': 'Y',
  'A4': 'H',
  'A#4': 'U',
  'B4': 'J',
  'C5': 'K',
  'C#5': 'O',
  'D5': 'L',
  'D#5': 'P',
  'E5': ';',
  'F5': '\''
};

export const mapMidiProgramToInstrument = (programNumber) => {
  const inst = INSTRUMENTS.find(i => i.gmIndex === programNumber);
  return inst ? inst.id : 'acoustic-piano';
};

export const getThemeBg = (theme) => {
  if (theme.isRainbow) return 'linear-gradient(135deg, #ff3366 0%, #ff9f43 25%, #2ebd59 50%, #00f0ff 75%, #0066ff 100%)';
  return `linear-gradient(135deg, ${theme.color}, ${theme.secondary})`;
};
