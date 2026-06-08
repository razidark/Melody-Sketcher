/**
 * @file useAudioEngine.js
 * @description Core Web Audio DSP coordinator. Instantiates the master effects rack (Distortion,
 * Chorus, Phaser, Delay, Reverb, EQ3, Limiter), sets up the multitrack channel strips (volume,
 * pan, mute, solo), manages the drum-machine sub-bus, and exposes a high-frequency real-time
 * FFT analyser for dashboard animations.
 * @module useAudioEngine
 */

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { createInstrument } from '../utils/instrumentFactory';

/**
 * Custom React hook managing the lifecycle and real-time parameters of the Tone.js audio engine.
 * 
 * @param {Object} params
 * @param {Array} params.layers - Active sequencer tracks containing volumes, pans, cuts, and ADSR attributes
 * @param {number} params.reverbLevel - Master JCReverb mix value (0 to 1)
 * @param {number} params.delayLevel - Master Delay wetness value (0 to 1)
 * @param {number} params.distortionLevel - Master Distortion grit amount (0 to 1)
 * @param {number} params.chorusLevel - Master Chorus wet level (0 to 1)
 * @param {number} params.phaserLevel - Master Phaser wet level (0 to 1)
 * @param {number} params.eqLowLevel - 3-Band EQ low-shelf decibels (-24 to +12)
 * @param {number} params.eqMidLevel - 3-Band EQ mid-shelf decibels (-24 to +12)
 * @param {number} params.eqHighLevel - 3-Band EQ high-shelf decibels (-24 to +12)
 * @param {number} params.masterVolume - Main output decibel level (-60 to +6)
 * @param {number} params.rhythmVolume - Drum-machine bus decibel level (-60 to +6)
 * @param {boolean} params.rhythmMute - Drum bus mute flag
 * @param {boolean} params.rhythmSolo - Drum bus solo flag
 * @returns {Object} Exposes active refs, trigger helpers, and real-time VU meter hooks
 */
export default function useAudioEngine({
  layers,
  reverbLevel,
  delayLevel,
  distortionLevel,
  chorusLevel,
  phaserLevel,
  eqLowLevel,
  eqMidLevel,
  eqHighLevel,
  masterVolume,
  rhythmVolume,
  rhythmMute,
  rhythmSolo
}) {
  const synthsRef = useRef({});
  const channelsRef = useRef({});
  const filtersRef = useRef({});
  const analyserRef = useRef(null);
  const limiterRef = useRef(null);
  const eqRef = useRef(null);
  const drumChannelRef = useRef(null);
  const kickRef = useRef(null);
  const snareRef = useRef(null);
  const snareFilterRef = useRef(null);
  const hihatRef = useRef(null);
  const crashRef = useRef(null);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const phaserRef = useRef(null);
  const chorusRef = useRef(null);
  const distortionRef = useRef(null);

  // Initialize Master Audio DSP Nodes
  useEffect(() => {
    analyserRef.current = new Tone.Analyser("fft", 32);
    limiterRef.current = new Tone.Limiter(-2).connect(analyserRef.current);
    analyserRef.current.toDestination();

    eqRef.current = new Tone.EQ3(eqLowLevel, eqMidLevel, eqHighLevel).connect(limiterRef.current);

    // Drum sub-bus channel
    drumChannelRef.current = new Tone.Channel({ volume: rhythmVolume }).connect(eqRef.current);
    
    // Drum Synthesizers connected directly to drum channel
    kickRef.current = new Tone.MembraneSynth({
      volume: -2,
      envelope: { attack: 0.001, decay: 0.22, sustain: 0.001, release: 0.22 },
      octaves: 6,
      pitchDecay: 0.05
    }).connect(drumChannelRef.current);

    // Filtered Noise Snare (makes it sound like a tight acoustic crack rather than static noise)
    snareFilterRef.current = new Tone.Filter({
      type: "bandpass",
      frequency: 1100,
      Q: 1.5
    }).connect(drumChannelRef.current);

    snareRef.current = new Tone.NoiseSynth({
      volume: -4,
      envelope: { attack: 0.001, decay: 0.13, sustain: 0 }
    }).connect(snareFilterRef.current);

    // Tight closed hi-hat (short decay, bright frequency, low harmonic ring)
    hihatRef.current = new Tone.MetalSynth({
      volume: -15,
      frequency: 450,
      envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
      resonance: 8500,
      harmonicity: 8.0,
      modulationIndex: 12
    }).connect(drumChannelRef.current);

    // Bright wash crash cymbal
    crashRef.current = new Tone.MetalSynth({
      volume: -8,
      frequency: 280,
      envelope: { attack: 0.005, decay: 1.4, sustain: 0 },
      resonance: 5500,
      harmonicity: 6.0,
      modulationIndex: 20
    }).connect(drumChannelRef.current);
    
    // Setup Master FX chain
    reverbRef.current = new Tone.JCReverb({ roomSize: 0.8, wet: reverbLevel }).connect(eqRef.current);
    delayRef.current = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.4, wet: delayLevel }).connect(reverbRef.current);
    phaserRef.current = new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 1000, wet: phaserLevel }).connect(delayRef.current);
    chorusRef.current = new Tone.Chorus(4, 2.5, 0.5).connect(phaserRef.current).start();
    chorusRef.current.wet.value = chorusLevel;
    distortionRef.current = new Tone.Distortion(0.4).connect(chorusRef.current);
    distortionRef.current.wet.value = distortionLevel;

    // Copy refs to local variables inside the effect to avoid eslint warning in cleanup
    const currentSynths = synthsRef.current;
    const currentChannels = channelsRef.current;
    const currentFilters = filtersRef.current;
    const currentLimiter = limiterRef.current;
    const currentAnalyser = analyserRef.current;
    const currentEq = eqRef.current;
    const currentReverb = reverbRef.current;
    const currentDelay = delayRef.current;
    const currentDistortion = distortionRef.current;
    const currentChorus = chorusRef.current;
    const currentPhaser = phaserRef.current;
    const currentDrumChannel = drumChannelRef.current;
    const currentKick = kickRef.current;
    const currentSnare = snareRef.current;
    const currentSnareFilter = snareFilterRef.current;
    const currentHihat = hihatRef.current;
    const currentCrash = crashRef.current;

    return () => {
      Object.values(currentSynths).forEach(synth => synth.dispose());
      Object.values(currentChannels).forEach(channel => channel.dispose());
      Object.values(currentFilters).forEach(filter => filter.dispose());
      currentLimiter?.dispose();
      currentAnalyser?.dispose();
      currentEq?.dispose();
      currentReverb?.dispose();
      currentDelay?.dispose();
      currentDistortion?.dispose();
      currentChorus?.dispose();
      currentPhaser?.dispose();
      currentDrumChannel?.dispose();
      currentKick?.dispose();
      currentSnare?.dispose();
      currentSnareFilter?.dispose();
      currentHihat?.dispose();
      currentCrash?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Master FX levels and Destination Volume
  useEffect(() => {
    if (reverbRef.current) reverbRef.current.wet.value = reverbLevel;
    if (delayRef.current) delayRef.current.wet.value = delayLevel;
    if (distortionRef.current) distortionRef.current.wet.value = distortionLevel;
    if (chorusRef.current) chorusRef.current.wet.value = chorusLevel;
    if (phaserRef.current) phaserRef.current.wet.value = phaserLevel;
    Tone.Destination.volume.value = masterVolume;
  }, [reverbLevel, delayLevel, distortionLevel, chorusLevel, phaserLevel, masterVolume]);

  // Synchronize EQ levels with Tone.EQ3 node
  useEffect(() => {
    if (eqRef.current) {
      eqRef.current.low.value = eqLowLevel;
      eqRef.current.mid.value = eqMidLevel;
      eqRef.current.high.value = eqHighLevel;
    }
  }, [eqLowLevel, eqMidLevel, eqHighLevel]);

  // Sync Channels & Synths based on Layers
  useEffect(() => {
    layers.forEach(layer => {
      // 1. Ensure a Tone.Filter exists for each React layer
      let filter = filtersRef.current[layer.id];
      if (!filter || filter.disposed) {
        filter = new Tone.Filter({
          type: "lowpass",
          frequency: layer.cutoff ?? 20000,
          Q: layer.resonance ?? 1
        });
        filtersRef.current[layer.id] = filter;
      }

      // 2. Ensure a Tone.Channel exists for each React layer
      let channel = channelsRef.current[layer.id];
      if (!channel || channel.disposed) {
        channel = new Tone.Channel({
          volume: layer.volume ?? 0,
          pan: layer.pan ?? 0,
          mute: layer.mute ?? false,
          solo: layer.solo ?? false
        });
        
        // Chain: filter -> channel -> Master FX
        filter.connect(channel);

        if (distortionRef.current && !distortionRef.current.disposed) {
          channel.connect(distortionRef.current);
        } else {
          channel.toDestination();
        }
        channelsRef.current[layer.id] = channel;
      }

      // 3. Ensure corresponding Synth exists and connect to that Layer Filter
      const instId = layer.instrument?.id || 'acoustic-piano';
      const existingSynth = synthsRef.current[layer.id];
      if (!existingSynth || existingSynth.disposed || existingSynth._instId !== instId) {
        if (existingSynth && !existingSynth.disposed) existingSynth.dispose();
        
        const synth = createInstrument(instId);
        synth.disconnect(); // Disconnect default routing
        synth.connect(filter);
        synthsRef.current[layer.id] = synth;
      }
    });
  }, [layers]);

  // Sync Channel volume, pan, mute, solo, filter, and ADSR in real-time with Tone.js
  useEffect(() => {
    layers.forEach(layer => {
      const channel = channelsRef.current[layer.id];
      if (channel) {
        if (channel.volume.value !== layer.volume) {
          channel.volume.rampTo(layer.volume ?? 0, 0.05);
        }
        if (channel.pan.value !== layer.pan) {
          channel.pan.rampTo(layer.pan ?? 0, 0.05);
        }
        channel.mute = layer.mute ?? false;
        channel.solo = layer.solo ?? false;
      }

      const filter = filtersRef.current[layer.id];
      if (filter && !filter.disposed) {
        if (filter.frequency.value !== (layer.cutoff ?? 20000)) {
          filter.frequency.rampTo(layer.cutoff ?? 20000, 0.05);
        }
        if (filter.Q.value !== (layer.resonance ?? 1)) {
          filter.Q.value = layer.resonance ?? 1;
        }
      }

      const synth = synthsRef.current[layer.id];
      if (synth && !synth.disposed && typeof synth.set === 'function') {
        try {
          synth.set({
            envelope: {
              attack: layer.attack ?? 0.01,
              decay: layer.decay ?? 0.2,
              sustain: layer.sustain ?? 0.6,
              release: layer.release ?? 0.8
            }
          });
          if (layer.oscillatorType && layer.instrument?.id !== 'drum-kit') {
            synth.set({
              oscillator: {
                type: layer.oscillatorType
              }
            });
          }
        } catch {
          // ignore
        }
      }
    });
  }, [layers]);

  // Sync Rhythm Channel parameter fader directly
  useEffect(() => {
    if (drumChannelRef.current) {
      if (drumChannelRef.current.volume.value !== rhythmVolume) {
        drumChannelRef.current.volume.rampTo(rhythmVolume, 0.05);
      }
      drumChannelRef.current.mute = rhythmMute;
      drumChannelRef.current.solo = rhythmSolo;
    }
  }, [rhythmVolume, rhythmMute, rhythmSolo]);

  // Audio trigger helpers
  const playNote = useCallback((noteName, layerId, duration = '8n') => {
    if (Tone.context.state !== 'running') {
      Tone.start().catch(() => {});
    }
    const synth = synthsRef.current[layerId];
    if (synth && !synth.disposed) {
      synth.triggerAttackRelease(noteName, duration);
    }
  }, []);

  const triggerAttack = useCallback((noteName, layerId) => {
    if (Tone.context.state !== 'running') {
      Tone.start().catch(() => {});
    }
    const synth = synthsRef.current[layerId];
    if (synth && !synth.disposed) {
      synth.triggerAttack(noteName);
    }
  }, []);

  const triggerRelease = useCallback((noteName, layerId) => {
    const synth = synthsRef.current[layerId];
    if (synth && !synth.disposed) {
      synth.triggerRelease(noteName);
    }
  }, []);

  return {
    synthsRef,
    channelsRef,
    analyserRef,
    limiterRef,
    eqRef,
    drumChannelRef,
    kickRef,
    snareRef,
    hihatRef,
    crashRef,
    reverbRef,
    delayRef,
    phaserRef,
    chorusRef,
    distortionRef,
    playNote,
    triggerAttack,
    triggerRelease
  };
}
