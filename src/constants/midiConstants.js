// Constants
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
  0: { id: 'acoustic-piano', name: 'Grand Piano', icon: '🎹' },
  4: { id: 'electric-piano', name: 'Studio EP', icon: '⚡' },
  5: { id: 'lofi-keys', name: 'Lo-Fi Keys', icon: '📼' },
  12: { id: 'marimba', name: 'Marimba', icon: '🪵' },
  19: { id: 'org', name: 'Church Organ', icon: '⛪' },
  24: { id: 'nylon-guitar', name: 'Nylon Guitar', icon: '🎸' },
  29: { id: 'electric-guitar', name: 'Overdrive Guitar', icon: '🤘' },
  36: { id: 'slap-bass', name: 'Slap Bass', icon: '🎸' },
  38: { id: 'synth-bass', name: 'Deep Sub', icon: '🌑' },
  39: { id: '808-bass', name: '808 Sub', icon: '🔊' },
  48: { id: 'strings', name: 'Cinematic Strings', icon: '🎻' },
  52: { id: 'choral', name: 'Choir Ahhs', icon: '🗣️' },
  62: { id: 'brass', name: 'Synth Brass', icon: '🎺' },
  73: { id: 'flute', name: 'Wood Flute', icon: '🌬️' },
  80: { id: 'pulse', name: 'Square Pulse', icon: '🔲' },
  81: { id: 'synth-lead', name: 'Hyper Saw', icon: '🔥' },
  87: { id: 'fm', name: 'FM Fusion', icon: '🌀' },
  89: { id: 'synth-pad', name: 'Dream Pad', icon: '☁️' },
  98: { id: 'bells', name: 'Crystal Bells', icon: '🔔' }
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
    case 'Pianos': return '🎹';
    case 'Percussion': return '🔔';
    case 'Organs': return '⛪';
    case 'Guitars': return '🎸';
    case 'Basses': return '🔊';
    case 'Strings': return '🎻';
    case 'Ensembles': return '🗣️';
    case 'Brass': return '🎺';
    case 'Reeds': return '🎷';
    case 'Pipes': return '🌬️';
    case 'Leads': return '🔥';
    case 'Pads': return '☁️';
    case 'Synth FX': return '🌀';
    case 'Ethnic': return '🪕';
    case 'Percussive': return '🥁';
    default: return '💥';
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
  icon: '🥁',
  gmIndex: 128
});

export const THEMES = [
  { id: 'rainbow', name: 'Prism', color: '#ff2e93', secondary: '#00f0ff', isRainbow: true },
  { id: 'violet', name: 'Amethyst', color: '#a78bfa', secondary: '#1e1b4b' },
  { id: 'emerald', name: 'Emerald', color: '#22ff80', secondary: '#022c22' },
  { id: 'rose', name: 'Ruby', color: '#ff6b6b', secondary: '#450a0a' },
  { id: 'blue', name: 'Sapphire', color: '#3a86ff', secondary: '#172554' },
  { id: 'amber', name: 'Amber', color: '#ffc300', secondary: '#451a03' }
];

export const TRACK_COLORS = [
  '#00f0ff', // Neon Cyan
  '#ff2e93', // Hot Pink
  '#22ff80', // Lime/Mint Green
  '#9d4edd', // Electric Purple
  '#ffc300', // Golden Amber
  '#ff6b6b', // Sunset Coral
  '#3a86ff', // Electric Blue
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

// Built-in curated interactive demo songs
export const DEMO_SONGS = [
  {
    name: 'Synthwave Pulse',
    bpm: 125,
    barCount: 4,
    rhythmMode: 'four-floor',
    tracks: [
      {
        name: 'Deep Bassline',
        instrumentId: 'synth-bass',
        color: '#22d3ee',
        notes: [
          // Bar 1 (A Minor)
          { name: 'A1', tick: 0, index: 75 },
          { name: 'A2', tick: 2, index: 63 },
          { name: 'A1', tick: 4, index: 75 },
          { name: 'A2', tick: 6, index: 63 },
          { name: 'A1', tick: 8, index: 75 },
          { name: 'A2', tick: 10, index: 63 },
          { name: 'A1', tick: 12, index: 75 },
          { name: 'A2', tick: 14, index: 63 },
          // Bar 2 (F Major)
          { name: 'F1', tick: 16, index: 79 },
          { name: 'F2', tick: 18, index: 67 },
          { name: 'F1', tick: 20, index: 79 },
          { name: 'F2', tick: 22, index: 67 },
          { name: 'F1', tick: 24, index: 79 },
          { name: 'F2', tick: 26, index: 67 },
          { name: 'F1', tick: 28, index: 79 },
          { name: 'F2', tick: 30, index: 67 },
          // Bar 3 (C Major)
          { name: 'C2', tick: 32, index: 72 },
          { name: 'C3', tick: 34, index: 60 },
          { name: 'C2', tick: 36, index: 72 },
          { name: 'C3', tick: 38, index: 60 },
          { name: 'C2', tick: 40, index: 72 },
          { name: 'C3', tick: 42, index: 60 },
          { name: 'C2', tick: 44, index: 72 },
          { name: 'C3', tick: 46, index: 60 },
          // Bar 4 (G Major)
          { name: 'G1', tick: 48, index: 77 },
          { name: 'G2', tick: 50, index: 65 },
          { name: 'G1', tick: 52, index: 77 },
          { name: 'G2', tick: 54, index: 65 },
          { name: 'G1', tick: 56, index: 77 },
          { name: 'G2', tick: 58, index: 65 },
          { name: 'G1', tick: 60, index: 77 },
          { name: 'G2', tick: 62, index: 65 }
        ]
      },
      {
        name: 'Retro Lead Arp',
        instrumentId: 'synth-lead',
        color: '#f472b6',
        notes: [
          // Bar 1 (Am)
          { name: 'A4', tick: 0, index: 51 },
          { name: 'B4', tick: 2, index: 49 },
          { name: 'C5', tick: 4, index: 48 },
          { name: 'E5', tick: 6, index: 44 },
          { name: 'D5', tick: 8, index: 46 },
          { name: 'C5', tick: 10, index: 48 },
          { name: 'B4', tick: 12, index: 49 },
          { name: 'G4', tick: 14, index: 53 },
          // Bar 2 (F)
          { name: 'F4', tick: 16, index: 55 },
          { name: 'G4', tick: 18, index: 53 },
          { name: 'A4', tick: 20, index: 51 },
          { name: 'C5', tick: 22, index: 48 },
          { name: 'B4', tick: 24, index: 49 },
          { name: 'A4', tick: 26, index: 51 },
          { name: 'G4', tick: 28, index: 53 },
          { name: 'E4', tick: 30, index: 56 },
          // Bar 3 (C)
          { name: 'C5', tick: 32, index: 48 },
          { name: 'D5', tick: 34, index: 46 },
          { name: 'E5', tick: 36, index: 44 },
          { name: 'G5', tick: 38, index: 41 },
          { name: 'F5', tick: 40, index: 43 },
          { name: 'E5', tick: 42, index: 44 },
          { name: 'D5', tick: 44, index: 46 },
          { name: 'B4', tick: 46, index: 49 },
          // Bar 4 (G)
          { name: 'G4', tick: 48, index: 53 },
          { name: 'A4', tick: 50, index: 51 },
          { name: 'B4', tick: 52, index: 49 },
          { name: 'D5', tick: 54, index: 46 },
          { name: 'C5', tick: 56, index: 48 },
          { name: 'B4', tick: 58, index: 49 },
          { name: 'A4', tick: 60, index: 51 },
          { name: 'B4', tick: 62, index: 49 }
        ]
      },
      {
        name: 'Dream Chords',
        instrumentId: 'synth-pad',
        color: '#818cf8',
        notes: [
          // Bar 1 (Am)
          { name: 'A3', tick: 0, index: 63 },
          { name: 'C4', tick: 0, index: 60 },
          { name: 'E4', tick: 0, index: 56 },
          { name: 'A3', tick: 8, index: 63 },
          { name: 'C4', tick: 8, index: 60 },
          { name: 'E4', tick: 8, index: 56 },
          // Bar 2 (F)
          { name: 'F3', tick: 16, index: 67 },
          { name: 'A3', tick: 16, index: 63 },
          { name: 'C4', tick: 16, index: 60 },
          { name: 'F3', tick: 24, index: 67 },
          { name: 'A3', tick: 24, index: 63 },
          { name: 'C4', tick: 24, index: 60 },
          // Bar 3 (C)
          { name: 'C3', tick: 32, index: 72 },
          { name: 'E3', tick: 32, index: 68 },
          { name: 'G3', tick: 32, index: 65 },
          { name: 'C3', tick: 40, index: 72 },
          { name: 'E3', tick: 40, index: 68 },
          { name: 'G3', tick: 40, index: 65 },
          // Bar 4 (G)
          { name: 'G3', tick: 48, index: 65 },
          { name: 'B3', tick: 48, index: 61 },
          { name: 'D4', tick: 48, index: 58 },
          { name: 'G3', tick: 56, index: 65 },
          { name: 'B3', tick: 56, index: 61 },
          { name: 'D4', tick: 56, index: 58 }
        ]
      }
    ]
  },
  {
    name: 'Cinematic Symphony',
    bpm: 92,
    barCount: 4,
    rhythmMode: 'ballad',
    tracks: [
      {
        name: 'String Swell',
        instrumentId: 'strings',
        color: '#fbbf24',
        notes: [
          // Bar 1 (D Minor)
          { name: 'D4', tick: 0, index: 58 },
          { name: 'F4', tick: 0, index: 55 },
          { name: 'A4', tick: 0, index: 51 },
          // Bar 2 (Bb Major)
          { name: 'A#3', tick: 16, index: 62 },
          { name: 'D4', tick: 16, index: 58 },
          { name: 'F4', tick: 16, index: 55 },
          // Bar 3 (F Major)
          { name: 'F3', tick: 32, index: 67 },
          { name: 'A3', tick: 32, index: 63 },
          { name: 'C4', tick: 32, index: 60 },
          // Bar 4 (C Major)
          { name: 'C4', tick: 48, index: 60 },
          { name: 'E4', tick: 48, index: 56 },
          { name: 'G4', tick: 48, index: 53 }
        ]
      },
      {
        name: 'Crystal Carillons',
        instrumentId: 'bells',
        color: '#34d399',
        notes: [
          // Bar 1 (Dm)
          { name: 'D5', tick: 0, index: 46 },
          { name: 'A5', tick: 4, index: 39 },
          { name: 'F5', tick: 8, index: 43 },
          { name: 'A5', tick: 12, index: 39 },
          // Bar 2 (Bb)
          { name: 'D5', tick: 16, index: 46 },
          { name: 'A#5', tick: 20, index: 38 },
          { name: 'F5', tick: 24, index: 43 },
          { name: 'A#5', tick: 28, index: 38 },
          // Bar 3 (F)
          { name: 'C5', tick: 32, index: 48 },
          { name: 'A5', tick: 36, index: 39 },
          { name: 'F5', tick: 40, index: 43 },
          { name: 'A5', tick: 44, index: 39 },
          // Bar 4 (C)
          { name: 'C5', tick: 48, index: 48 },
          { name: 'G5', tick: 52, index: 41 },
          { name: 'E5', tick: 56, index: 44 },
          { name: 'G5', tick: 60, index: 41 }
        ]
      },
      {
        name: 'Solo Flute',
        instrumentId: 'flute',
        color: '#38bdf8',
        notes: [
          // Bar 1 (Dm)
          { name: 'D6', tick: 2, index: 34 },
          { name: 'E6', tick: 6, index: 32 },
          { name: 'F6', tick: 10, index: 31 },
          { name: 'A6', tick: 14, index: 27 },
          // Bar 2 (Bb)
          { name: 'G6', tick: 18, index: 29 },
          { name: 'F6', tick: 22, index: 31 },
          { name: 'D6', tick: 26, index: 34 },
          { name: 'A#5', tick: 30, index: 38 },
          // Bar 3 (F)
          { name: 'C6', tick: 34, index: 36 },
          { name: 'D6', tick: 38, index: 34 },
          { name: 'E6', tick: 42, index: 32 },
          { name: 'G6', tick: 46, index: 29 },
          // Bar 4 (C)
          { name: 'F6', tick: 50, index: 31 },
          { name: 'E6', tick: 54, index: 32 },
          { name: 'C6', tick: 58, index: 36 },
          { name: 'D6', tick: 62, index: 34 }
        ]
      }
    ]
  },
  {
    name: 'Lofi Chill Hop',
    bpm: 80,
    barCount: 4,
    rhythmMode: 'boom-bap',
    tracks: [
      {
        name: 'Rhodes Jazz Keys',
        instrumentId: 'lofi-keys',
        color: '#a78bfa',
        notes: [
          // Bar 1 (Em9)
          { name: 'E3', tick: 0, index: 68 },
          { name: 'G3', tick: 0, index: 65 },
          { name: 'B3', tick: 0, index: 61 },
          { name: 'D4', tick: 0, index: 58 },
          { name: 'F#4', tick: 0, index: 54 },
          { name: 'E3', tick: 8, index: 68 },
          { name: 'G3', tick: 8, index: 65 },
          { name: 'B3', tick: 8, index: 61 },
          { name: 'D4', tick: 8, index: 58 },
          { name: 'F#4', tick: 8, index: 54 },
          // Bar 2 (Am9)
          { name: 'A3', tick: 16, index: 63 },
          { name: 'C4', tick: 16, index: 60 },
          { name: 'E4', tick: 16, index: 56 },
          { name: 'G4', tick: 16, index: 53 },
          { name: 'B4', tick: 16, index: 49 },
          { name: 'A3', tick: 24, index: 63 },
          { name: 'C4', tick: 24, index: 60 },
          { name: 'E4', tick: 24, index: 56 },
          { name: 'G4', tick: 24, index: 53 },
          { name: 'B4', tick: 24, index: 49 },
          // Bar 3 (D7)
          { name: 'D3', tick: 32, index: 70 },
          { name: 'F#3', tick: 32, index: 66 },
          { name: 'A3', tick: 32, index: 63 },
          { name: 'C4', tick: 32, index: 60 },
          { name: 'D3', tick: 40, index: 70 },
          { name: 'F#3', tick: 40, index: 66 },
          { name: 'A3', tick: 40, index: 63 },
          { name: 'C4', tick: 40, index: 60 },
          // Bar 4 (Gmaj7)
          { name: 'G3', tick: 48, index: 65 },
          { name: 'B3', tick: 48, index: 61 },
          { name: 'D4', tick: 48, index: 58 },
          { name: 'F#4', tick: 48, index: 54 },
          { name: 'G3', tick: 56, index: 65 },
          { name: 'B3', tick: 56, index: 61 },
          { name: 'D4', tick: 56, index: 58 },
          { name: 'F#4', tick: 56, index: 54 }
        ]
      },
      {
        name: 'Lazy Lofi Bass',
        instrumentId: '808-bass',
        color: '#fb7171',
        notes: [
          // Bar 1
          { name: 'E2', tick: 0, index: 80 },
          { name: 'E2', tick: 4, index: 80 },
          { name: 'G2', tick: 10, index: 77 },
          { name: 'B2', tick: 14, index: 73 },
          // Bar 2
          { name: 'A2', tick: 16, index: 75 },
          { name: 'A2', tick: 20, index: 75 },
          { name: 'C3', tick: 26, index: 72 },
          { name: 'E3', tick: 30, index: 68 },
          // Bar 3
          { name: 'D2', tick: 32, index: 82 },
          { name: 'D2', tick: 36, index: 82 },
          { name: 'F#2', tick: 42, index: 78 },
          { name: 'A2', tick: 46, index: 75 },
          // Bar 4
          { name: 'G2', tick: 48, index: 77 },
          { name: 'G2', tick: 52, index: 77 },
          { name: 'B2', tick: 58, index: 73 },
          { name: 'D3', tick: 62, index: 70 }
        ]
      },
      {
        name: 'Guitar Plucks',
        instrumentId: 'nylon-guitar',
        color: '#fb923c',
        notes: [
          // Bar 1
          { name: 'B4', tick: 4, index: 49 },
          { name: 'G4', tick: 6, index: 53 },
          { name: 'F#4', tick: 12, index: 54 },
          { name: 'E4', tick: 14, index: 56 },
          // Bar 2
          { name: 'C5', tick: 20, index: 48 },
          { name: 'B4', tick: 22, index: 49 },
          { name: 'A4', tick: 28, index: 51 },
          { name: 'G4', tick: 30, index: 53 },
          // Bar 3
          { name: 'A4', tick: 36, index: 51 },
          { name: 'F#4', tick: 38, index: 54 },
          { name: 'E4', tick: 44, index: 56 },
          { name: 'D4', tick: 46, index: 58 },
          // Bar 4
          { name: 'B4', tick: 52, index: 49 },
          { name: 'D5', tick: 54, index: 46 },
          { name: 'F#5', tick: 60, index: 42 },
          { name: 'G5', tick: 61, index: 41 }
        ]
      }
    ]
  },
  {
    name: 'Neon Horizon',
    bpm: 118,
    barCount: 4,
    rhythmMode: 'four-floor',
    tracks: [
      {
        name: 'Sub Bass',
        instrumentId: 'synth-bass',
        color: '#10b981',
        notes: [
          // Bar 1 (Am)
          { name: 'A1', tick: 0, index: 75 },
          { name: 'A2', tick: 4, index: 63 },
          { name: 'E2', tick: 8, index: 68 },
          { name: 'A1', tick: 12, index: 75 },
          // Bar 2 (F)
          { name: 'F1', tick: 16, index: 79 },
          { name: 'F2', tick: 20, index: 67 },
          { name: 'C2', tick: 24, index: 72 },
          { name: 'F1', tick: 28, index: 79 },
          // Bar 3 (C)
          { name: 'C2', tick: 32, index: 72 },
          { name: 'C3', tick: 36, index: 60 },
          { name: 'G2', tick: 40, index: 65 },
          { name: 'C2', tick: 44, index: 72 },
          // Bar 4 (G)
          { name: 'G1', tick: 48, index: 77 },
          { name: 'G2', tick: 52, index: 65 },
          { name: 'D2', tick: 56, index: 70 },
          { name: 'G1', tick: 60, index: 77 }
        ]
      },
      {
        name: 'Neon Chords',
        instrumentId: 'synth-pad',
        color: '#8b5cf6',
        notes: [
          // Bar 1 (Am)
          { name: 'A3', tick: 0, index: 63 },
          { name: 'C4', tick: 0, index: 60 },
          { name: 'E4', tick: 0, index: 56 },
          { name: 'A4', tick: 0, index: 51 },
          // Bar 2 (F)
          { name: 'F3', tick: 16, index: 67 },
          { name: 'A3', tick: 16, index: 63 },
          { name: 'C4', tick: 16, index: 60 },
          { name: 'F4', tick: 16, index: 55 },
          // Bar 3 (C)
          { name: 'C3', tick: 32, index: 72 },
          { name: 'E3', tick: 32, index: 68 },
          { name: 'G3', tick: 32, index: 65 },
          { name: 'C4', tick: 32, index: 60 },
          // Bar 4 (G)
          { name: 'G3', tick: 48, index: 65 },
          { name: 'B3', tick: 48, index: 61 },
          { name: 'D4', tick: 48, index: 58 },
          { name: 'G4', tick: 48, index: 53 }
        ]
      },
      {
        name: 'Cyber Lead',
        instrumentId: 'synth-lead',
        color: '#ec4899',
        notes: [
          // Bar 1
          { name: 'E5', tick: 0, index: 44 },
          { name: 'C5', tick: 3, index: 48 },
          { name: 'A4', tick: 6, index: 51 },
          { name: 'E5', tick: 10, index: 44 },
          { name: 'D5', tick: 14, index: 46 },
          // Bar 2
          { name: 'C5', tick: 16, index: 48 },
          { name: 'A4', tick: 19, index: 51 },
          { name: 'G4', tick: 22, index: 53 },
          { name: 'C5', tick: 26, index: 48 },
          { name: 'A4', tick: 30, index: 51 },
          // Bar 3
          { name: 'G5', tick: 32, index: 41 },
          { name: 'E5', tick: 35, index: 44 },
          { name: 'C5', tick: 38, index: 48 },
          { name: 'G5', tick: 42, index: 41 },
          { name: 'F5', tick: 46, index: 43 },
          // Bar 4
          { name: 'D5', tick: 48, index: 46 },
          { name: 'B4', tick: 51, index: 49 },
          { name: 'G4', tick: 54, index: 53 },
          { name: 'D5', tick: 58, index: 46 },
          { name: 'B4', tick: 62, index: 49 }
        ]
      }
    ]
  }
];

export const mapMidiProgramToInstrument = (programNumber) => {
  const inst = INSTRUMENTS.find(i => i.gmIndex === programNumber);
  return inst ? inst.id : 'acoustic-piano';
};

export const getThemeBg = (theme) => {
  if (theme.isRainbow) return 'linear-gradient(135deg, #ff87c3, #ffb480, #fcf499, #9be8aa, #6bd6e1, #84a2f8)';
  return `linear-gradient(135deg, ${theme.color}, ${theme.secondary})`;
};
