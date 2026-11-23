/**
 * @file instrumentFactory.js
 * @description Highly optimized audio voicing engine. Dynamically instantiates Tone.Sampler
 * soundfont mapping arrays using public domain community recordings, with seamless, silent
 * polyphonic synthesizer fallbacks. Incorporates strict gain staging limits (-14dB base volume)
 * to avoid frequency stacking and volume explosions.
 * @module instrumentFactory
 */

import * as Tone from 'tone';
import { INSTRUMENTS } from '../constants/midiConstants';

const SAMPLES_BASE = 'https://nbrosowsky.github.io/tonejs-instruments/samples/';

/**
 * Converts standard scientific note names into matching mp3 filenames.
 * e.g., "C#4" becomes "Cs4.mp3".
 * @param {string[]} notes - Array of note identifiers
 * @returns {Object.<string, string>} Mapping of note names to asset URLs
 */
function sampleUrls(notes) {
  const urls = {};
  for (const n of notes) urls[n] = n.replace('#', 's') + '.mp3';
  return urls;
}


// Minimal sample sets per instrument (Tone.Sampler interpolates between these)
const SAMPLES = {
  piano: sampleUrls([
    'A1','C2','E2','A2','C3','E3','A3','C4','E4','A4','C5','E5','A5','C6','E6','A6','C7'
  ]),
  'guitar-nylon': sampleUrls([
    'B1','E2','A2','D3','A3','E4','A4','D5','E5'
  ]),
  'guitar-acoustic': sampleUrls([
    'D2','A2','E3','A3','D4','A4','D5'
  ]),
  'guitar-electric': sampleUrls([
    'E2','A2','C3','A3','C4','A4','C5','C6'
  ]),
  'bass-electric': sampleUrls([
    'A#1','E1','A#2','E2','A#3','E3','G4'
  ]),
  violin: sampleUrls([
    'A3','C4','E4','A4','C5','E5','A5','C6','E6','A6','C7'
  ]),
  cello: sampleUrls([
    'C2','E2','A2','C3','E3','A3','C4','E4','A4','C5'
  ]),
  flute: sampleUrls([
    'C4','E4','A4','C5','E5','A5','C6','E6','A6'
  ]),
  trumpet: sampleUrls([
    'A3','C4','D#4','F4','G4','A#4','D5','F5','A5','C6'
  ]),
  trombone: sampleUrls([
    'A#1','C#2','D#2','F2','A#2','C3','D3','D#3','F3','A#3','C4','D4','D#4','F4'
  ]),
  'french-horn': sampleUrls([
    'A1','C2','D#2','G2','A3','C4','D3','D5','F3','F5'
  ]),
  tuba: sampleUrls([
    'A#1','D#2','F1','F2','A#2','D3','A#3','D4','F3'
  ]),
  clarinet: sampleUrls([
    'D3','A#3','D4','F3','F4','A#4','D5','F5','A#5','D6','F#6'
  ]),
  saxophone: sampleUrls([
    'C#3','E3','A#3','C4','E4','A4','C5','E5','A5'
  ]),
  bassoon: sampleUrls([
    'A2','A3','A4','C3','C4','C5','E4','G2','G3','G4'
  ]),
  organ: sampleUrls([
    'A1','C1','C2','C3','C4','C5','C6','D#1','D#2','D#3','D#4','D#5','F#1','F#2','F#3','F#4','F#5','A2','A3','A4','A5'
  ]),
  harp: sampleUrls([
    'B1','D2','E1','E3','F2','G1','A2','C3','C5','D4','E5','F4','F6','G3','G5','A4','A6','B3','B5','D6','D7','F7'
  ]),
  xylophone: sampleUrls([
    'C5','G4','G5','C6','G6','C7','G7','C8'
  ]),
  contrabass: sampleUrls([
    'F#1','G1','A#1','C2','D2','E2','F#2','G#2','A2','C#3','E3','G#3','B3'
  ]),
  harmonium: sampleUrls([
    'C2','C3','C4','C5','E2','E3','E4','G2','G3','G4','A2','A3','A4'
  ]),
};

// Map GM category → sample library folder + release time
const CATEGORY_SAMPLE = {
  'Pianos': { sample: 'piano', release: 1.2 },
  'Guitars': { sample: 'guitar-acoustic', release: 1.0 },
  'Basses': { sample: 'bass-electric', release: 0.8 },
  'Strings': { sample: 'cello', release: 2.0 },
  'Ensembles': { sample: 'violin', release: 2.0 },
  'Brass': { sample: 'trumpet', release: 0.6 },
  'Reeds': { sample: 'clarinet', release: 0.5 },
  'Pipes': { sample: 'flute', release: 0.5 },
  'Organs': { sample: 'organ', release: 0.8 },
  'Percussion': { sample: 'xylophone', release: 0.4 },
  'Percussive': { sample: 'xylophone', release: 0.4 },
  'Ethnic': { sample: 'harmonium', release: 1.0 },
};

// GM index → specific sample override (for more accurate mapping)
const GM_SAMPLE_OVERRIDE = {
  32: { sample: 'contrabass', release: 1.0 }, // Acoustic Bass
  40: { sample: 'violin', release: 1.5 },     // Violin
  41: { sample: 'violin', release: 1.5 },     // Viola
  42: { sample: 'cello', release: 2.0 },      // Cello
  43: { sample: 'contrabass', release: 2.5 },  // Contrabass
  46: { sample: 'harp', release: 1.5 },        // Orchestral Harp
  56: { sample: 'trumpet', release: 0.6 },     // Trumpet
  57: { sample: 'trombone', release: 0.8 },    // Trombone
  58: { sample: 'tuba', release: 0.8 },        // Tuba
  60: { sample: 'french-horn', release: 0.8 }, // French Horn
  64: { sample: 'saxophone', release: 0.5 },   // Soprano Sax
  65: { sample: 'saxophone', release: 0.5 },   // Alto Sax
  66: { sample: 'saxophone', release: 0.5 },   // Tenor Sax
  67: { sample: 'saxophone', release: 0.5 },   // Baritone Sax
  68: { sample: 'clarinet', release: 0.5 },    // Oboe (close to clarinet)
  70: { sample: 'bassoon', release: 0.6 },     // Bassoon
  71: { sample: 'clarinet', release: 0.5 },    // Clarinet
  73: { sample: 'flute', release: 0.4 },       // Flute
};

const BUFFERS_CACHE = new Map();

function createSampler(sampleName, release = 1) {
  const urls = SAMPLES[sampleName];
  if (!urls) return null;

  let buffers = BUFFERS_CACHE.get(sampleName);
  if (!buffers) {
    // Map note names to MIDI numbers for ToneAudioBuffers keys
    const urlMap = {};
    for (const note of Object.keys(urls)) {
      const mid = new Tone.Frequency(note).toMidi();
      urlMap[mid] = urls[note];
    }

    buffers = new Tone.ToneAudioBuffers({
      urls: urlMap,
      baseUrl: SAMPLES_BASE + sampleName + '/',
      onload: () => {
        console.log(`[Audio Engine] Samples loaded and cached for: ${sampleName}`);
      },
      onerror: (err) => {
        console.error(`[Audio Engine] Failed to load samples for: ${sampleName}`, err);
      }
    });
    BUFFERS_CACHE.set(sampleName, buffers);
  }

  const sampler = new Tone.Sampler({ release });

  // Dispose the empty buffers created by default in the constructor
  if (sampler._buffers) {
    try {
      sampler._buffers.dispose();
    } catch (e) {
      console.debug('[Audio Engine] Default sampler buffers already disposed', e);
    }
  }

  // Assign the shared cached ToneAudioBuffers
  sampler._buffers = buffers;

  return sampler;
}

function makeHybridSampler(sampler, fallbackSynth) {
  if (!sampler) return fallbackSynth;
  
  sampler._fallbackSynth = fallbackSynth;
  let targetDestination = null;
  
  const originalTriggerAttackRelease = sampler.triggerAttackRelease.bind(sampler);
  const originalTriggerAttack = sampler.triggerAttack.bind(sampler);
  const originalTriggerRelease = sampler.triggerRelease.bind(sampler);
  const originalDispose = sampler.dispose.bind(sampler);
  const originalConnect = sampler.connect.bind(sampler);
  const originalDisconnect = sampler.disconnect.bind(sampler);

  sampler.connect = (destination, outputNum, inputNum) => {
    targetDestination = destination;
    originalConnect(destination, outputNum, inputNum);
    return sampler;
  };

  sampler.disconnect = (destination, outputNum, inputNum) => {
    targetDestination = null;
    originalDisconnect(destination, outputNum, inputNum);
    try { fallbackSynth.disconnect(); } catch (e) {
      console.debug('[Audio Engine] Fallback synth disconnect failed', e);
    }
    return sampler;
  };

  sampler.triggerAttackRelease = (notes, duration, time, velocity) => {
    if (sampler.loaded) {
      try { fallbackSynth.disconnect(); } catch (e) {
        console.debug('[Audio Engine] Fallback synth disconnect failed', e);
      }
      originalTriggerAttackRelease(notes, duration, time, velocity);
    } else {
      if (targetDestination) {
        try { fallbackSynth.connect(targetDestination); } catch (e) {
          console.debug('[Audio Engine] Fallback synth connect failed', e);
        }
      }
      fallbackSynth.triggerAttackRelease(notes, duration, time, velocity);
    }
    return sampler;
  };

  sampler.triggerAttack = (notes, time, velocity) => {
    if (sampler.loaded) {
      try { fallbackSynth.disconnect(); } catch (e) {
        console.debug('[Audio Engine] Fallback synth disconnect failed', e);
      }
      originalTriggerAttack(notes, time, velocity);
    } else {
      if (targetDestination) {
        try { fallbackSynth.connect(targetDestination); } catch (e) {
          console.debug('[Audio Engine] Fallback synth connect failed', e);
        }
      }
      fallbackSynth.triggerAttack(notes, time, velocity);
    }
    return sampler;
  };

  sampler.triggerRelease = (notes, time) => {
    if (sampler.loaded) {
      originalTriggerRelease(notes, time);
    } else {
      fallbackSynth.triggerRelease(notes, time);
    }
    return sampler;
  };

  sampler.dispose = () => {
    sampler._buffers = { dispose: () => {} };
    try { fallbackSynth.dispose(); } catch (e) {
      console.debug('[Audio Engine] Fallback synth dispose failed', e);
    }
    try { originalDispose(); } catch (e) {
      console.debug('[Audio Engine] Sampler dispose failed', e);
    }
    return sampler;
  };

  return sampler;
}

// ─── Drum Kit ─────────────────────────────────────────────────────
class SynthDrumKit {
  constructor() {
    this.name = 'SynthDrumKit';
    this.volumeNode = new Tone.Volume(0);
    this.volume = this.volumeNode.volume;

    this.kick = new Tone.MembraneSynth({
      volume: -4,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.001, release: 0.3 },
      pitchDecay: 0.08, octaves: 7
    }).connect(this.volumeNode);

    this.snareFilter = new Tone.Filter({
      type: 'bandpass', frequency: 1200, Q: 1.8
    }).connect(this.volumeNode);

    this.snare = new Tone.NoiseSynth({
      volume: -6,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
    }).connect(this.snareFilter);

    this.hihat = new Tone.MetalSynth({
      volume: -18,
      frequency: 500,
      envelope: { attack: 0.001, decay: 0.04, sustain: 0 },
      resonance: 8500, harmonicity: 8.0, modulationIndex: 12
    }).connect(this.volumeNode);

    this.crash = new Tone.MetalSynth({
      volume: -10,
      frequency: 280,
      envelope: { attack: 0.005, decay: 1.6, sustain: 0 },
      resonance: 5500, harmonicity: 6.0, modulationIndex: 20
    }).connect(this.volumeNode);
  }

  triggerAttackRelease(note, duration, time, velocity) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) this.kick.triggerAttackRelease(note, duration, time, velocity);
    else if (midi < 60) this.snare.triggerAttackRelease(duration, time, velocity);
    else if (midi < 72) this.hihat.triggerAttackRelease(duration, time, velocity);
    else this.crash.triggerAttackRelease(duration, time, velocity);
    return this;
  }

  triggerAttack(note, time, velocity) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) this.kick.triggerAttack(note, time, velocity);
    else if (midi < 60) this.snare.triggerAttack(time, velocity);
    else if (midi < 72) this.hihat.triggerAttack(time, velocity);
    else this.crash.triggerAttack(time, velocity);
    return this;
  }

  triggerRelease(note, time) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) this.kick.triggerRelease(time);
    else if (midi < 60) this.snare.triggerRelease(time);
    else if (midi < 72) this.hihat.triggerRelease(time);
    else this.crash.triggerRelease(time);
    return this;
  }

  connect(d) { this.volumeNode.connect(d); return this; }
  disconnect() { this.volumeNode.disconnect(); return this; }
  dispose() {
    this.kick.dispose(); this.snare.dispose(); this.snareFilter.dispose();
    this.hihat.dispose(); this.crash.dispose(); this.volumeNode.dispose();
  }
}

// ─── Main Factory ─────────────────────────────────────────────────
/**
 * Factory function that instantiates the requested synth voice or sample player.
 * Configures the base volume, limits polyphony count, loads sample buffers, and builds
 * default ADSR/oscillator attributes for custom synths.
 * 
 * @param {string} id - The unique instrument identifier (e.g., 'acoustic-piano', 'strings', 'drum-kit')
 * @returns {Tone.PolySynth|Tone.Sampler|SynthDrumKit} A playable Tone.js instrument node
 */
export function createInstrument(id) {
  let synth;
  const poly = { maxPolyphony: 12 };

  switch (id) {
    // ── Sample-based flagship instruments ──────────────────────
    case 'acoustic-piano': {
      const sampler = createSampler('piano', 1.2);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 3, modulationIndex: 10, oscillator: { type: 'sine' },
        modulation: { type: 'sine' },
        envelope: { attack: 0.001, decay: 1.5, sustain: 0.1, release: 1.2 },
        modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'nylon-guitar': {
      const sampler = createSampler('guitar-nylon', 1.0);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.Synth, options: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 1.2, sustain: 0, release: 1.2 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'electric-guitar': {
      const sampler = createSampler('guitar-electric', 0.8);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 0.5, modulationIndex: 6,
        oscillator: { type: 'sawtooth' }, modulation: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.2 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'slap-bass': {
      const sampler = createSampler('bass-electric', 0.6);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 1, modulationIndex: 4,
        oscillator: { type: 'triangle' }, modulation: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
        modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'strings': {
      const sampler = createSampler('violin', 2.0);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.Synth, options: {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 12 },
        envelope: { attack: 0.6, decay: 1.5, sustain: 0.85, release: 2.5 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'flute': {
      const sampler = createSampler('flute', 0.5);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.AMSynth, options: {
        harmonicity: 2, oscillator: { type: 'sine' },
        envelope: { attack: 0.08, decay: 0.2, sustain: 1, release: 0.5 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'brass': {
      const sampler = createSampler('trumpet', 0.6);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.MonoSynth, options: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.8 },
        filter: { type: 'lowpass', Q: 1 },
        filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.8, baseFrequency: 300, octaves: 3 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'bells': {
      const sampler = createSampler('xylophone', 0.8);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 3.5, modulationIndex: 4,
        envelope: { attack: 0.005, decay: 1.5, sustain: 0, release: 1.5 },
        modulationEnvelope: { attack: 0.005, decay: 1.5, sustain: 0, release: 1.5 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'marimba': {
      const sampler = createSampler('xylophone', 0.4);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.Synth, options: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.4 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    case 'org': {
      const sampler = createSampler('organ', 0.8);
      const fallback = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 2, modulationIndex: 1.5,
        oscillator: { type: 'sine' }, modulation: { type: 'triangle' },
        envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.5 }
      }});
      synth = makeHybridSampler(sampler, fallback);
      break;
    }

    // ── Enhanced synth-only instruments ────────────────────────
    case 'electric-piano':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 1, modulationIndex: 1.2,
        oscillator: { type: 'sine' }, modulation: { type: 'triangle' },
        envelope: { attack: 0.008, decay: 2.5, sustain: 0.15, release: 1.5 },
        modulationEnvelope: { attack: 0.03, decay: 0.5, sustain: 0, release: 0.5 }
      }});
      break;

    case 'lofi-keys':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.AMSynth, options: {
        harmonicity: 1.01, oscillator: { type: 'sine' }, modulation: { type: 'sine' },
        envelope: { attack: 0.04, decay: 1.8, sustain: 0.35, release: 2.2 }
      }});
      break;

    case 'choral':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        harmonicity: 2.5, modulationIndex: 1.2,
        oscillator: { type: 'sine' }, modulation: { type: 'sawtooth' },
        envelope: { attack: 1.0, decay: 1.0, sustain: 1.0, release: 2.5 }
      }});
      break;

    case 'synth-lead':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.Synth, options: {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1 }
      }});
      break;

    case 'synth-pad':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.MonoSynth, options: {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 18 },
        envelope: { attack: 1.5, decay: 1.0, sustain: 0.8, release: 3 },
        filter: { type: 'lowpass', Q: 1, rolloff: -24 },
        filterEnvelope: { attack: 2, decay: 1, sustain: 0.8, release: 3, baseFrequency: 300, octaves: 3 }
      }});
      break;

    case 'synth-bass':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.MonoSynth, options: {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 1 },
        filter: { type: 'lowpass', Q: 2 },
        filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8, baseFrequency: 100, octaves: 3.5 }
      }});
      break;

    case '808-bass':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.MembraneSynth, options: {
        pitchDecay: 0.05, octaves: 4, oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 1.5, sustain: 0.1, release: 2 }
      }});
      break;

    case 'pulse':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.Synth, options: {
        oscillator: { type: 'pulse', width: 0.2 },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 }
      }});
      break;

    case 'fm':
      synth = new Tone.PolySynth({ ...poly, voice: Tone.FMSynth, options: {
        modulationIndex: 8,
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 1 }
      }});
      break;

    case 'drum-kit':
      synth = new SynthDrumKit();
      break;

    // ── GM Category Fallbacks (sample-based where possible) ───
    default: {
      const matched = INSTRUMENTS.find(i => i.id === id);
      const category = matched?.category || 'Leads';
      const gmIndex = matched?.gmIndex ?? -1;

      // Try sample loading first
      let sampler;
      const gmOverride = GM_SAMPLE_OVERRIDE[gmIndex];
      if (gmOverride) {
        sampler = createSampler(gmOverride.sample, gmOverride.release);
      }
      if (!sampler) {
        const catSample = CATEGORY_SAMPLE[category];
        if (catSample) {
          sampler = createSampler(catSample.sample, catSample.release);
        }
      }

      // Synth fallbacks for categories without samples
      let voiceClass, synthOpts;
      switch (category) {
        case 'Leads':
          voiceClass = Tone.Synth;
          synthOpts = {
            oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1 }
          };
          break;
        case 'Pads':
          voiceClass = Tone.MonoSynth;
          synthOpts = {
            oscillator: { type: 'fatsawtooth', count: 3, spread: 15 },
            envelope: { attack: 1.6, decay: 1.2, sustain: 0.85, release: 3.5 },
            filter: { type: 'lowpass', Q: 1.0 },
            filterEnvelope: { attack: 2.0, decay: 1.2, sustain: 0.8, release: 3.5, baseFrequency: 250, octaves: 2.5 }
          };
          break;
        case 'Synth FX':
        case 'Sound Effects':
          voiceClass = Tone.FMSynth;
          synthOpts = {
            harmonicity: 5.2, modulationIndex: 8,
            oscillator: { type: 'square' },
            envelope: { attack: 0.15, decay: 1.5, sustain: 0.3, release: 2.5 }
          };
          break;
        default:
          voiceClass = Tone.Synth;
          synthOpts = {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
          };
      }
      const fallback = new Tone.PolySynth({ ...poly, voice: voiceClass, options: synthOpts });
      synth = makeHybridSampler(sampler, fallback);
    }
  }

  synth.volume.value = -14;
  synth._instId = id;
  return synth;
}
