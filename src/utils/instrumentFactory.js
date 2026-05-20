import * as Tone from 'tone';
import { INSTRUMENTS } from '../constants/midiConstants';

class SynthDrumKit {
  constructor() {
    this.name = 'SynthDrumKit';
    this.volumeNode = new Tone.Volume(0);
    this.volume = this.volumeNode.volume; // Expose the Tone.Signal for synth.volume.value compatibility

    this.kick = new Tone.MembraneSynth({
      envelope: { attack: 0.001, decay: 0.22, sustain: 0.001, release: 0.22 },
      pitchDecay: 0.05,
      octaves: 6
    }).connect(this.volumeNode);

    this.snareFilter = new Tone.Filter({
      type: "bandpass",
      frequency: 1100,
      Q: 1.5
    }).connect(this.volumeNode);

    this.snare = new Tone.NoiseSynth({
      volume: -4,
      envelope: { attack: 0.001, decay: 0.13, sustain: 0 }
    }).connect(this.snareFilter);

    this.hihat = new Tone.MetalSynth({
      volume: -15,
      frequency: 450,
      envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
      resonance: 8500,
      harmonicity: 8.0,
      modulationIndex: 12
    }).connect(this.volumeNode);

    this.crash = new Tone.MetalSynth({
      volume: -8,
      frequency: 280,
      envelope: { attack: 0.005, decay: 1.4, sustain: 0 },
      resonance: 5500,
      harmonicity: 6.0,
      modulationIndex: 20
    }).connect(this.volumeNode);
  }

  triggerAttackRelease(note, duration, time, velocity) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) { // C3 and below: Kick
      this.kick.triggerAttackRelease(note, duration, time, velocity);
    } else if (midi < 60) { // C3 to B3: Snare
      this.snare.triggerAttackRelease(duration, time, velocity);
    } else if (midi < 72) { // C4 to B4: Hihat
      this.hihat.triggerAttackRelease(duration, time, velocity);
    } else { // C5 and above: Crash
      this.crash.triggerAttackRelease(duration, time, velocity);
    }
    return this;
  }

  triggerAttack(note, time, velocity) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) {
      this.kick.triggerAttack(note, time, velocity);
    } else if (midi < 60) {
      this.snare.triggerAttack(time, velocity);
    } else if (midi < 72) {
      this.hihat.triggerAttack(time, velocity);
    } else {
      this.crash.triggerAttack(time, velocity);
    }
    return this;
  }

  triggerRelease(note, time) {
    const midi = Tone.Midi(note).toMidi();
    if (midi < 48) {
      this.kick.triggerRelease(time);
    } else if (midi < 60) {
      this.snare.triggerRelease(time);
    } else if (midi < 72) {
      this.hihat.triggerRelease(time);
    } else {
      this.crash.triggerRelease(time);
    }
    return this;
  }

  connect(destination) {
    this.volumeNode.connect(destination);
    return this;
  }

  disconnect() {
    this.volumeNode.disconnect();
    return this;
  }

  dispose() {
    this.kick.dispose();
    this.snare.dispose();
    this.snareFilter.dispose();
    this.hihat.dispose();
    this.crash.dispose();
    this.volumeNode.dispose();
  }
}

export function createInstrument(id) {
  let synth;
  // Reduced polyphony from 64 to 32 to improve performance while still being plenty for typical tracks
  const polyOptions = { maxPolyphony: 32 }; 
  
  switch (id) {
    case 'acoustic-piano':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'triangle8' }, // triangle8 gives a richer, slightly brighter acoustic tone
          envelope: { attack: 0.005, decay: 1.5, sustain: 0.15, release: 2 }
        }
      });
      break;
      
    case 'electric-piano':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 1,
          modulationIndex: 1.2,
          oscillator: { type: 'sine' },
          modulation: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 2.5, sustain: 0.2, release: 1.5 },
          modulationEnvelope: { attack: 0.05, decay: 0.5, sustain: 0, release: 0.5 }
        }
      });
      break;

    case 'lofi-keys':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.AMSynth,
        options: {
          harmonicity: 1.01, // Creates a slight detuned chorus/wobble effect
          oscillator: { type: 'sine' },
          modulation: { type: 'sine' },
          envelope: { attack: 0.05, decay: 1.5, sustain: 0.4, release: 2 }
        }
      });
      break;

    case 'strings':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.AMSynth,
        options: {
          harmonicity: 1,
          oscillator: { type: 'sawtooth' },
          modulation: { type: 'sine' },
          envelope: { attack: 0.8, decay: 1.5, sustain: 0.8, release: 2.5 }
        }
      });
      break;

    case 'choral':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 3,
          modulationIndex: 1.5,
          oscillator: { type: 'sine' },
          modulation: { type: 'sawtooth' },
          envelope: { attack: 1.2, decay: 1.0, sustain: 1.0, release: 2.5 }
        }
      });
      break;

    case 'nylon-guitar':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 1.2, sustain: 0, release: 1.2 }
        }
      });
      break;

    case 'electric-guitar':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 0.5,
          modulationIndex: 10,
          oscillator: { type: 'sawtooth' },
          modulation: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.2 }
        }
      });
      break;

    case 'slap-bass':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 1,
          modulationIndex: 5,
          oscillator: { type: 'triangle' },
          modulation: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8 },
          modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0 }
        }
      });
      break;

    case 'synth-lead':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'fatsawtooth', count: 3, spread: 30 },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1 }
        }
      });
      break;

    case 'synth-pad':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.MonoSynth, // MonoSynth gives access to a filter envelope
        options: {
          oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
          envelope: { attack: 1.5, decay: 1.0, sustain: 0.8, release: 3 },
          filter: { type: 'lowpass', Q: 1, rolloff: -24 },
          filterEnvelope: { attack: 2, decay: 1, sustain: 0.8, release: 3, baseFrequency: 300, octaves: 3 }
        }
      });
      break;

    case 'synth-bass':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.MonoSynth,
        options: {
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 1 },
          filter: { type: 'lowpass', Q: 2 },
          filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.8, baseFrequency: 100, octaves: 4 }
        }
      });
      break;

    case '808-bass':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.MembraneSynth,
        options: {
          pitchDecay: 0.05,
          octaves: 4,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 1.5, sustain: 0.1, release: 2 }
        }
      });
      break;

    case 'brass':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.MonoSynth,
        options: {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.8 },
          filter: { type: 'lowpass', Q: 1 },
          filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.8, baseFrequency: 300, octaves: 3 }
        }
      });
      break;

    case 'bells':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 3.5,
          modulationIndex: 5,
          envelope: { attack: 0.005, decay: 1.5, sustain: 0, release: 1.5 },
          modulationEnvelope: { attack: 0.005, decay: 1.5, sustain: 0, release: 1.5 }
        }
      });
      break;

    case 'marimba':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.4 }
        }
      });
      break;

    case 'flute':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.AMSynth,
        options: {
          harmonicity: 2,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 0.5 }
        }
      });
      break;

    case 'org':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          harmonicity: 2,
          modulationIndex: 2,
          oscillator: { type: 'sine' },
          modulation: { type: 'triangle' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.5 }
        }
      });
      break;

    case 'pulse':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.Synth,
        options: {
          oscillator: { type: 'pulse', width: 0.2 },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.4 }
        }
      });
      break;

    case 'fm':
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: Tone.FMSynth,
        options: {
          modulationIndex: 12,
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 1 }
        }
      });
      break;

    case 'drum-kit':
      synth = new SynthDrumKit();
      break;

    default: {
      const matchedInstrument = INSTRUMENTS.find(i => i.id === id);
      const category = matchedInstrument ? matchedInstrument.category : 'Leads';
      const gmIndex = matchedInstrument ? matchedInstrument.gmIndex : -1;
      
      let voiceClass;
      let synthOpts;
      
      switch (category) {
        case 'Pianos':
          voiceClass = Tone.Synth;
          synthOpts = {
            oscillator: { type: 'triangle16' },
            envelope: { attack: 0.005, decay: 1.8, sustain: 0.15, release: 2 }
          };
          if (gmIndex === 1) { // Bright Acoustic Piano
            synthOpts.oscillator.type = 'sawtooth';
            synthOpts.envelope.decay = 1.0;
          } else if (gmIndex === 2) { // Electric Grand Piano
            voiceClass = Tone.FMSynth;
            synthOpts = {
              harmonicity: 1.5,
              modulationIndex: 4,
              envelope: { attack: 0.01, decay: 1.2, sustain: 0.3, release: 1.5 }
            };
          } else if (gmIndex === 3) { // Honky-tonk Piano
            synthOpts.oscillator.type = 'pulse';
            synthOpts.oscillator.width = 0.4;
            synthOpts.envelope.decay = 0.8;
          } else if (gmIndex === 6) { // Harpsichord
            synthOpts.oscillator.type = 'sine8';
            synthOpts.envelope = { attack: 0.002, decay: 0.4, sustain: 0.01, release: 0.4 };
          } else if (gmIndex === 7) { // Clavinet
            synthOpts.oscillator.type = 'sawtooth';
            synthOpts.envelope = { attack: 0.002, decay: 0.5, sustain: 0.02, release: 0.5 };
          }
          break;
          
        case 'Percussion':
        case 'Percussive':
          voiceClass = Tone.FMSynth;
          synthOpts = {
            harmonicity: 3.5,
            modulationIndex: 8,
            envelope: { attack: 0.002, decay: 0.8, sustain: 0.0, release: 0.8 },
            modulationEnvelope: { attack: 0.002, decay: 0.8, sustain: 0.0, release: 0.8 }
          };
          if (gmIndex === 8) { // Celesta
            synthOpts.harmonicity = 4.0;
            synthOpts.modulationIndex = 3;
            synthOpts.envelope.decay = 0.5;
          } else if (gmIndex === 9) { // Glockenspiel
            synthOpts.harmonicity = 6.0;
            synthOpts.modulationIndex = 12;
            synthOpts.envelope.decay = 0.3;
          } else if (gmIndex === 10) { // Music Box
            synthOpts.harmonicity = 5.0;
            synthOpts.modulationIndex = 2;
            synthOpts.envelope.decay = 0.6;
          } else if (gmIndex === 11) { // Vibraphone
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'sine' },
              envelope: { attack: 0.08, decay: 1.5, sustain: 0.2, release: 1.5 }
            };
          } else if (gmIndex === 13) { // Xylophone
            synthOpts.harmonicity = 3.0;
            synthOpts.envelope.decay = 0.25;
          } else if (gmIndex === 14) { // Tubular Bells
            synthOpts.harmonicity = 2.76;
            synthOpts.modulationIndex = 15;
            synthOpts.envelope.decay = 2.0;
          } else if (gmIndex === 15) { // Dulcimer
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.01, decay: 0.6, sustain: 0.05, release: 0.6 }
            };
          } else if (gmIndex === 115) { // Steel Drums
            synthOpts.harmonicity = 4.8;
            synthOpts.modulationIndex = 10;
            synthOpts.envelope.decay = 0.9;
          }
          break;
          
        case 'Organs':
          voiceClass = Tone.FMSynth;
          synthOpts = {
            harmonicity: 2,
            modulationIndex: 1.5,
            oscillator: { type: 'sine' },
            modulation: { type: 'triangle' },
            envelope: { attack: 0.08, decay: 0.1, sustain: 0.9, release: 0.8 }
          };
          if (gmIndex === 16) { // Drawbar Organ
            synthOpts.harmonicity = 1.0;
            synthOpts.modulationIndex = 0.5;
          } else if (gmIndex === 17) { // Percussive Organ
            synthOpts.envelope.attack = 0.01;
            synthOpts.modulationIndex = 3.0;
          } else if (gmIndex === 18) { // Rock Organ
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'sawtooth' },
              envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.6 }
            };
          } else if (gmIndex === 21) { // Accordion
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'square' },
              envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.5 }
            };
          } else if (gmIndex === 22) { // Harmonica
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.15, decay: 0.2, sustain: 0.7, release: 0.5 }
            };
          }
          break;
          
        case 'Guitars':
          voiceClass = Tone.Synth;
          synthOpts = {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.01, decay: 1.2, sustain: 0.05, release: 1.2 }
          };
          if (gmIndex === 25) { // Steel Guitar
            synthOpts.oscillator.type = 'sawtooth';
            synthOpts.envelope.decay = 1.5;
            synthOpts.envelope.release = 1.5;
          } else if (gmIndex === 26) { // Jazz Guitar
            synthOpts.oscillator.type = 'triangle';
            synthOpts.envelope.decay = 0.9;
          } else if (gmIndex === 27) { // Clean Guitar
            synthOpts.oscillator.type = 'triangle8';
            synthOpts.envelope.decay = 1.1;
          } else if (gmIndex === 28) { // Muted Guitar
            synthOpts.oscillator.type = 'pulse';
            synthOpts.oscillator.width = 0.2;
            synthOpts.envelope = { attack: 0.005, decay: 0.15, sustain: 0.01, release: 0.15 };
          } else if (gmIndex === 30) { // Distortion Guitar
            synthOpts.oscillator.type = 'sawtooth';
            synthOpts.envelope = { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.8 };
          } else if (gmIndex === 31) { // Guitar harmonics
            voiceClass = Tone.FMSynth;
            synthOpts = {
              harmonicity: 3.0,
              modulationIndex: 6,
              envelope: { attack: 0.005, decay: 0.8, sustain: 0.01, release: 0.8 }
            };
          }
          break;
          
        case 'Basses':
          voiceClass = Tone.MonoSynth;
          synthOpts = {
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.8 },
            filter: { type: 'lowpass', Q: 1.5 },
            filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8, baseFrequency: 150, octaves: 3 }
          };
          if (gmIndex === 32) { // Acoustic Bass
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.05, decay: 0.8, sustain: 0.1, release: 1.0 }
            };
          } else if (gmIndex === 33) { // Finger Bass
            synthOpts.oscillator.type = 'sine4';
            synthOpts.filterEnvelope.baseFrequency = 100;
          } else if (gmIndex === 34) { // Pick Bass
            synthOpts.oscillator.type = 'sawtooth';
            synthOpts.filterEnvelope.baseFrequency = 200;
          } else if (gmIndex === 35) { // Fretless Bass
            synthOpts.oscillator.type = 'triangle';
            synthOpts.envelope.attack = 0.06;
          }
          break;
          
        case 'Strings':
        case 'Ensembles':
          voiceClass = Tone.AMSynth;
          synthOpts = {
            harmonicity: 1,
            oscillator: { type: 'sawtooth' },
            modulation: { type: 'sine' },
            envelope: { attack: 0.4, decay: 1.2, sustain: 0.8, release: 2.2 }
          };
          if (gmIndex === 40) { // Violin
            synthOpts.envelope.attack = 0.15;
            synthOpts.envelope.release = 1.0;
          } else if (gmIndex === 42) { // Cello
            synthOpts.envelope.attack = 0.25;
            synthOpts.oscillator.type = 'sawtooth';
          } else if (gmIndex === 43) { // Contrabass
            synthOpts.envelope.attack = 0.35;
            synthOpts.envelope.release = 2.5;
          } else if (gmIndex === 45) { // Pizzicato Strings
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.005, decay: 0.25, sustain: 0.01, release: 0.25 }
            };
          } else if (gmIndex === 46) { // Orchestral Harp
            voiceClass = Tone.Synth;
            synthOpts = {
              oscillator: { type: 'triangle' },
              envelope: { attack: 0.01, decay: 1.5, sustain: 0.05, release: 1.5 }
            };
          } else if (gmIndex === 47) { // Timpani
            voiceClass = Tone.MembraneSynth;
            synthOpts = {
              envelope: { attack: 0.001, decay: 0.6, sustain: 0.01, release: 0.6 }
            };
          }
          break;
          
        case 'Brass':
          voiceClass = Tone.MonoSynth;
          synthOpts = {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.12, decay: 0.3, sustain: 0.75, release: 1.0 },
            filter: { type: 'lowpass', Q: 1.2 },
            filterEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.0, baseFrequency: 250, octaves: 4 }
          };
          if (gmIndex === 56) { // Trumpet
            synthOpts.envelope.attack = 0.06;
            synthOpts.filterEnvelope.attack = 0.05;
          } else if (gmIndex === 57) { // Trombone
            synthOpts.envelope.attack = 0.15;
            synthOpts.filterEnvelope.attack = 0.12;
          } else if (gmIndex === 58) { // Tuba
            synthOpts.envelope.attack = 0.25;
            synthOpts.filterEnvelope.baseFrequency = 120;
          }
          break;
          
        case 'Reeds':
        case 'Pipes':
          voiceClass = Tone.AMSynth;
          synthOpts = {
            harmonicity: 1.5,
            oscillator: { type: 'triangle' },
            modulation: { type: 'sine' },
            envelope: { attack: 0.08, decay: 0.2, sustain: 0.85, release: 0.6 }
          };
          if (gmIndex === 72) { // Piccolo
            synthOpts.envelope.attack = 0.02;
            synthOpts.envelope.release = 0.3;
          } else if (gmIndex === 74) { // Recorder
            synthOpts.envelope.attack = 0.06;
            synthOpts.envelope.release = 0.4;
          } else if (gmIndex === 75) { // Pan Flute
            synthOpts.envelope.attack = 0.12;
            synthOpts.envelope.release = 0.8;
          }
          break;
          
        case 'Pads':
          voiceClass = Tone.MonoSynth;
          synthOpts = {
            oscillator: { type: 'fatsawtooth', count: 3, spread: 15 },
            envelope: { attack: 1.6, decay: 1.2, sustain: 0.85, release: 3.5 },
            filter: { type: 'lowpass', Q: 1.0 },
            filterEnvelope: { attack: 2.0, decay: 1.2, sustain: 0.8, release: 3.5, baseFrequency: 250, octaves: 2.5 }
          };
          if (gmIndex === 91) { // Pad 4 (choir)
            voiceClass = Tone.AMSynth;
            synthOpts = {
              harmonicity: 1.0,
              oscillator: { type: 'sawtooth' },
              envelope: { attack: 1.2, decay: 1.0, sustain: 0.8, release: 2.5 }
            };
          }
          break;
          
        case 'Synth FX':
        case 'Sound Effects':
          voiceClass = Tone.FMSynth;
          synthOpts = {
            harmonicity: 5.2,
            modulationIndex: 15,
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
      
      synth = new Tone.PolySynth({
        ...polyOptions,
        voice: voiceClass,
        options: synthOpts
      });
    }
  }

  synth.volume.value = -12; // Prevent clipping
  synth._instId = id;
  return synth;
}
