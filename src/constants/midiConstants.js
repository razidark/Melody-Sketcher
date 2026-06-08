import { 
  Piano, Bell, Speaker, Guitar, Music, Disc, Wind, AudioWaveform, 
  Mic2, Radio, Drum, Flame, Zap, Cloud, Waves, Volume2 
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

const GM_NAMES = [
  "Acoustic Grand Piano", "Bright Acoustic Piano", "Electric Grand Piano", "Honky-tonk Piano",
  "Electric Piano 1", "Electric Piano 2", "Harpsichord", "Clavinet",
  "Celesta", "Glockenspiel", "Music Box", "Vibraphone", "Marimba", "Xylophone", "Tubular Bells", "Dulcimer",
  "Drawbar Organ", "Percussive Organ", "Rock Organ", "Church Organ", "Reed Organ", "Accordion", "Harmonica", "Tango Accordion",
  "Acoustic Guitar (nylon)", "Acoustic Guitar (steel)", "Electric Guitar (jazz)", "Electric Guitar (clean)", "Electric Guitar (muted)", "Overdriven Guitar", "Distortion Guitar", "Guitar harmonics",
  "Acoustic Bass", "Electric Bass (finger)", "Electric Bass (pick)", "Fretless Bass", "Slap Bass 1", "Slap Bass 2", "Synth Bass 1", "Synth Bass 2",
  "Violin", "Viola", "Cello", "Contrabass", "Tremolo Strings", "Pizzicato Strings", "Orchestral Harp", "Timpani",
  "String Ensemble 1", "String Ensemble 2", "Synth Strings 1", "Synth Strings 2", "Choir Aahs", "Voice Oohs", "Synth Voice", "Orchestra Hit",
  "Trumpet", "Trombone", "Tuba", "Muted Trumpet", "French Horn", "Brass Section", "Synth Brass 1", "Synth Brass 2",
  "Soprano Sax", "Alto Sax", "Tenor Sax", "Baritone Sax", "Oboe", "English Horn", "Bassoon", "Clarinet",
  "Piccolo", "Flute", "Recorder", "Pan Flute", "Blown Bottle", "Shakuhachi", "Whistle", "Ocarina",
  "Lead 1 (square)", "Lead 2 (sawtooth)", "Lead 3 (calliope)", "Lead 4 (chiff)", "Lead 5 (charang)", "Lead 6 (voice)", "Lead 7 (fifths)", "Lead 8 (bass+lead)",
  "Pad 1 (new age)", "Pad 2 (warm)", "Pad 3 (polysynth)", "Pad 4 (choir)", "Pad 5 (bowed)", "Pad 6 (metallic)", "Pad 7 (halo)", "Pad 8 (sweep)",
  "FX 1 (rain)", "FX 2 (soundtrack)", "FX 3 (crystal)", "FX 4 (atmosphere)", "FX 5 (brightness)", "FX 6 (goblins)", "FX 7 (echoes)", "FX 8 (sci-fi)",
  "Sitar", "Banjo", "Shamisen", "Koto", "Kalimba", "Bagpipe", "Fiddle", "Shanai",
  "Tinkle Bell", "Agogo", "Steel Drums", "Woodblock", "Taiko Drum", "Melodic Tom", "Synth Drum", "Reverse Cymbal",
  "Guitar Fret Noise", "Breath Noise", "Seashore", "Bird Tweet", "Telephone Ring", "Helicopter", "Applause", "Gunshot"
];

const CUSTOM_OVERRIDE = {
  0: { id: 'acoustic-piano', name: 'Grand Piano', icon: Piano },
  4: { id: 'electric-piano', name: 'Studio EP', icon: Zap },
  5: { id: 'lofi-keys', name: 'Lo-Fi Keys', icon: Radio },
  12: { id: 'marimba', name: 'Marimba', icon: Disc },
  19: { id: 'org', name: 'Church Organ', icon: Radio },
  24: { id: 'nylon-guitar', name: 'Nylon Guitar', icon: Guitar },
  29: { id: 'electric-guitar', name: 'Overdrive Guitar', icon: Flame },
  36: { id: 'slap-bass', name: 'Slap Bass', icon: Guitar },
  38: { id: 'synth-bass', name: 'Deep Sub', icon: Volume2 },
  39: { id: '808-bass', name: '808 Sub', icon: Speaker },
  48: { id: 'strings', name: 'Cinematic Strings', icon: Music },
  52: { id: 'choral', name: 'Choir Ahhs', icon: Mic2 },
  62: { id: 'brass', name: 'Synth Brass', icon: AudioWaveform },
  73: { id: 'flute', name: 'Wood Flute', icon: Wind },
  80: { id: 'pulse', name: 'Square Pulse', icon: AudioWaveform },
  81: { id: 'synth-lead', name: 'Hyper Saw', icon: Flame },
  87: { id: 'fm', name: 'FM Fusion', icon: Waves },
  89: { id: 'synth-pad', name: 'Dream Pad', icon: Cloud },
  98: { id: 'bells', name: 'Crystal Bells', icon: Bell }
};

const getCategory = (index) => {
  if (index >= 0 && index <= 7) return 'Pianos';
  if (index >= 8 && index <= 15) return 'Percussion';
  if (index >= 16 && index <= 23) return 'Organs';
  if (index >= 24 && index <= 31) return 'Guitars';
  if (index >= 32 && index <= 39) return 'Basses';
  if (index >= 40 && index <= 47) return 'Strings';
  if (index >= 48 && index <= 55) return 'Ensembles';
  if (index >= 56 && index <= 63) return 'Brass';
  if (index >= 64 && index <= 71) return 'Reeds';
  if (index >= 72 && index <= 79) return 'Pipes';
  if (index >= 80 && index <= 87) return 'Leads';
  if (index >= 88 && index <= 95) return 'Pads';
  if (index >= 96 && index <= 103) return 'Synth FX';
  if (index >= 104 && index <= 111) return 'Ethnic';
  if (index >= 112 && index <= 119) return 'Percussive';
  return 'Sound Effects';
};

const getIcon = (category) => {
  switch (category) {
    case 'Pianos': return Piano;
    case 'Percussion': return Bell;
    case 'Organs': return Radio;
    case 'Guitars': return Guitar;
    case 'Basses': return Speaker;
    case 'Strings': return Music;
    case 'Ensembles': return Mic2;
    case 'Brass': return AudioWaveform;
    case 'Reeds': return Wind;
    case 'Pipes': return Wind;
    case 'Leads': return Flame;
    case 'Pads': return Cloud;
    case 'Synth FX': return Waves;
    case 'Ethnic': return Music;
    case 'Percussive': return Drum;
    default: return AudioWaveform;
  }
};

export const INSTRUMENTS = GM_NAMES.map((name, index) => {
  if (CUSTOM_OVERRIDE[index]) {
    return {
      id: CUSTOM_OVERRIDE[index].id,
      name: CUSTOM_OVERRIDE[index].name,
      category: getCategory(index),
      icon: CUSTOM_OVERRIDE[index].icon,
      gmIndex: index
    };
  }
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name,
    category: getCategory(index),
    icon: getIcon(getCategory(index)),
    gmIndex: index
  };
});

// Add the Studio Kit
INSTRUMENTS.push({
  id: 'drum-kit',
  name: 'Studio Kit',
  category: 'Drums',
  icon: Drum,
  gmIndex: 128
});

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
