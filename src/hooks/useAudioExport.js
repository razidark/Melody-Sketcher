import { useState, useCallback } from 'react';
import * as Tone from 'tone';
import { midiToJson } from '@midi-json-tools/midi-to-json';
import { jsonToMidi } from '@midi-json-tools/json-to-midi';
import { audioBufferToWav } from '../utils/wavEncoder';
import { createInstrument } from '../utils/instrumentFactory';
import { 
  ALL_NOTES,
  INSTRUMENTS,
  TRACK_COLORS,
  GRID_SUBDIVISIONS,
  mapMidiProgramToInstrument
} from '../constants/midiConstants';

export default function useAudioExport({
  layers,
  bpm,
  barCount,
  rhythmMode,
  rhythmMute,
  rhythmVolume,
  reverbLevel,
  delayLevel,
  distortionLevel,
  chorusLevel,
  phaserLevel,
  eqLowLevel,
  eqMidLevel,
  eqHighLevel,
  totalTicks,
  setBpm,
  setBarCount,
  setLayers,
  setActiveLayerId
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleMidiUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null; // Reset input to allow re-uploads

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target.result;
        const midi = midiToJson(arrayBuffer);
        
        if (!midi || !midi.tracks) return;

        const division = midi.division || 480;
        const ticksPer16th = division / 4;
        let maxTickIndex = 0;
        const channelMap = new Map(); // Key: trackIdx_channelIdx

        midi.tracks.forEach((track, trackIdx) => {
          let currentTick = 0;
          let currentTrackName = `Track ${trackIdx + 1}`;
          
          track.forEach(event => {
            currentTick += event.delta || 0;
            if (event.setTempo || event.set_tempo) {
              const tempoData = event.setTempo || event.set_tempo;
              const mpb = tempoData.microsecondsPerBeat || tempoData.microseconds_per_beat;
              if (mpb) setBpm(Math.round(60000000 / mpb));
            }
            if (event.trackName || event.track_name) {
              const nameData = event.trackName || event.track_name;
              currentTrackName = typeof nameData === 'string' ? nameData : (nameData.text || currentTrackName);
            }
          });

          currentTick = 0;
          track.forEach(event => {
            currentTick += event.delta || 0;
            
            const msg = event.noteOn || event.note_on || event.programChange || event.program_change || event.noteOff || event.note_off || event;
            const channel = msg.channel ?? msg.chan ?? event.channel ?? event.chan ?? 0;
            
            const key = `${trackIdx}_${channel}`;
            if (!channelMap.has(key)) {
              channelMap.set(key, { 
                notes: [], 
                program: -1, 
                name: currentTrackName, 
                isDrum: channel === 9 
              });
            }
            const group = channelMap.get(key);

            const pc = event.programChange || event.program_change || (event.type === 'programChange' ? event : null);
            if (pc) {
              group.program = pc.programNumber ?? pc.program ?? pc.value ?? group.program;
            }

            const note = event.noteOn || event.note_on || (event.type === 'noteOn' ? event : null);
            if (note && (note.velocity > 0 || note.vel > 0 || note.velocity === undefined)) {
              const midiNumber = note.noteNumber ?? note.note ?? note.midi ?? note.value;
              const tickIndex = Math.round(currentTick / ticksPer16th);
              maxTickIndex = Math.max(maxTickIndex, tickIndex);
              
              const noteInfo = ALL_NOTES.find(n => n.midi === midiNumber);
              if (noteInfo) {
                 group.notes.push({ ...noteInfo, tick: tickIndex, index: ALL_NOTES.indexOf(noteInfo) });
              }
            }
          });
        });

        const newLayers = [];
        let trackCounter = 1;

        channelMap.forEach((group) => {
          if (group.notes.length === 0) return;

          let instId;
          if (group.isDrum) {
            instId = 'drum-kit';
            group.name = group.name.includes("Track") ? "Drum Kit" : group.name;
          } else {
            instId = group.program !== -1 
              ? mapMidiProgramToInstrument(group.program) 
              : INSTRUMENTS[trackCounter % INSTRUMENTS.length].id;
          }

          const instrument = INSTRUMENTS.find(i => i.id === instId) || INSTRUMENTS[0];
          
          newLayers.push({
            id: trackCounter,
            name: group.name,
            instrument: instrument,
            notes: group.notes,
            color: TRACK_COLORS[(trackCounter - 1) % TRACK_COLORS.length],
            volume: 0,
            pan: 0,
            mute: false,
            solo: false
          });
          trackCounter++;
        });

        if (newLayers.length > 0) {
          const requiredBars = Math.ceil((maxTickIndex + 1) / (4 * GRID_SUBDIVISIONS));
          if (requiredBars > barCount) {
             setBarCount(requiredBars);
          }
          setLayers(newLayers);
          setActiveLayerId(newLayers[0].id);
          alert(`Successfully imported ${newLayers.length} tracks! Expanded timeline to ${requiredBars} bars.`);
        } else {
          alert("No valid notes found in the MIDI file.");
        }
      } catch (err) {
        console.error("MIDI Import Error:", err);
        alert("Failed to parse MIDI file. Ensure it's a valid .mid file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [barCount, setBpm, setBarCount, setLayers, setActiveLayerId]);

  // MIDI Binary Export (.mid)
  const exportMidi = useCallback(() => {
    try {
      const division = 96; // 96 ticks per quarter note
      const ticksPer16th = 24; // 96 / 4 = 24 MIDI ticks per grid tick

      // 1. Tempo Track
      const tempoTrack = [
        { delta: 0, trackName: 'Tempo Track' },
        { delta: 0, setTempo: { microsecondsPerBeat: Math.round(60000000 / bpm) } },
        { delta: 0, endOfTrack: true }
      ];

      // 2. Instrument Tracks
      const tracks = [tempoTrack];

      layers.forEach((layer, layerIdx) => {
        const events = [];
        const isDrum = layer.instrument.id === 'drum-kit';
        const channel = isDrum ? 9 : (layerIdx >= 9 ? layerIdx + 1 : layerIdx);

        // Gather all note-on and note-off events
        layer.notes.forEach(note => {
          const absoluteStart = note.tick * ticksPer16th;
          // default duration is 2 grid ticks (8th note)
          const absoluteEnd = (note.tick + 2) * ticksPer16th;

          events.push({
            absoluteTick: absoluteStart,
            type: 'noteOn',
            noteNumber: note.midi,
            velocity: 90
          });

          events.push({
            absoluteTick: absoluteEnd,
            type: 'noteOff',
            noteNumber: note.midi,
            velocity: 0
          });
        });

        // Sort events chronologically by absolute tick
        events.sort((a, b) => a.absoluteTick - b.absoluteTick);

        // Convert absolute ticks to relative delta ticks
        const trackEvents = [
          { delta: 0, trackName: layer.name }
        ];

        let lastAbsoluteTick = 0;
        events.forEach(evt => {
          const delta = evt.absoluteTick - lastAbsoluteTick;
          lastAbsoluteTick = evt.absoluteTick;

          if (evt.type === 'noteOn') {
            trackEvents.push({
              delta,
              noteOn: {
                noteNumber: evt.noteNumber,
                velocity: evt.velocity,
                channel
              }
            });
          } else {
            trackEvents.push({
              delta,
              noteOff: {
                noteNumber: evt.noteNumber,
                velocity: evt.velocity,
                channel
              }
            });
          }
        });

        trackEvents.push({ delta: 0, endOfTrack: true });
        tracks.push(trackEvents);
      });

      const midiJson = {
        division,
        format: 1,
        tracks
      };

      const arrayBuffer = jsonToMidi(midiJson);
      const blob = new Blob([arrayBuffer], { type: 'audio/midi' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'melody_sketch.mid';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('MIDI Export failed:', err);
      alert('MIDI Export failed: ' + err.message);
    }
  }, [bpm, layers]);

  // High-fidelity Offline WAV Audio Export
  const exportWav = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    setIsExporting(true);
    setExportProgress(10);
    
    const secondsPerTick = 60 / (bpm * GRID_SUBDIVISIONS);
    const duration = totalTicks * secondsPerTick + 3.0; // add 3s tail for FX release
    
    try {
      const buffer = await Tone.Offline(() => {
        // 1. Recreate Limiter and EQ3 console bus
        const offlineLimiter = new Tone.Limiter(-2).toDestination();
        const offlineEq = new Tone.EQ3(eqLowLevel, eqMidLevel, eqHighLevel).connect(offlineLimiter);
        
        // 2. Recreate Master FX chain in offline context (JCReverb matches live engine)
        const offlineReverb = new Tone.JCReverb({ roomSize: 0.8, wet: reverbLevel }).connect(offlineEq);
        const offlineDelay = new Tone.FeedbackDelay({ delayTime: "8n", feedback: 0.4, wet: delayLevel }).connect(offlineReverb);
        const offlinePhaser = new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 1000, wet: phaserLevel }).connect(offlineDelay);
        const offlineChorus = new Tone.Chorus(4, 2.5, 0.5).connect(offlinePhaser).start();
        offlineChorus.wet.value = chorusLevel;
        const offlineDistortion = new Tone.Distortion(0.4).connect(offlineChorus);
        offlineDistortion.wet.value = distortionLevel;
        
        // 3. Recreate drum bus and drum instruments if rhythm is enabled
        let offlineDrumChannel, offlineKick, offlineSnare, offlineHihat, offlineCrash;
        if (rhythmMode !== 'off' && !rhythmMute) {
          offlineDrumChannel = new Tone.Channel({ volume: rhythmVolume }).connect(offlineEq);
          offlineKick = new Tone.MembraneSynth({
            volume: -2,
            envelope: { attack: 0.001, decay: 0.22, sustain: 0.001, release: 0.22 },
            octaves: 6,
            pitchDecay: 0.05
          }).connect(offlineDrumChannel);

          const offlineSnareFilter = new Tone.Filter({
            type: "bandpass",
            frequency: 1100,
            Q: 1.5
          }).connect(offlineDrumChannel);

          offlineSnare = new Tone.NoiseSynth({
            volume: -4,
            envelope: { attack: 0.001, decay: 0.13, sustain: 0 }
          }).connect(offlineSnareFilter);

          offlineHihat = new Tone.MetalSynth({
            volume: -15,
            frequency: 450,
            envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
            resonance: 8500,
            harmonicity: 8.0,
            modulationIndex: 12
          }).connect(offlineDrumChannel);

          offlineCrash = new Tone.MetalSynth({
            volume: -8,
            frequency: 280,
            envelope: { attack: 0.005, decay: 1.4, sustain: 0 },
            resonance: 5500,
            harmonicity: 6.0,
            modulationIndex: 20
          }).connect(offlineDrumChannel);
          
          // Pre-calculate bar density for auto-sync drums
          const tickIndex = new Map();
          for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const lNotes = layer.notes;
            for (let j = 0; j < lNotes.length; j++) {
              const note = lNotes[j];
              if (!tickIndex.has(note.tick)) tickIndex.set(note.tick, []);
              tickIndex.get(note.tick).push({ layerId: layer.id, name: note.name, tick: note.tick, index: note.index });
            }
          }
          const barDensity = new Map();
          tickIndex.forEach((notes, tick) => {
            const bar = Math.floor(tick / 16);
            barDensity.set(bar, (barDensity.get(bar) || 0) + notes.length);
          });

          for (let tick = 0; tick < totalTicks; tick++) {
            const time = tick * secondsPerTick;
            const beatInBar = tick % 16;
            const currentBar = Math.floor(tick / 16);
            const density = barDensity.get(currentBar) || 0;
            const hasNotesHere = tickIndex.has(tick);
            const isBarStart = beatInBar === 0;

            if (rhythmMode === 'auto') {
              const kickBeats = density > 8 ? [0, 3, 6, 8, 11, 14] : density > 4 ? [0, 6, 8, 14] : [0, 8];
              if (kickBeats.includes(beatInBar)) offlineKick.triggerAttackRelease('C1', '8n', time);
              if (beatInBar === 4 || beatInBar === 12) {
                offlineSnare.triggerAttackRelease('16n', time);
              } else if (density > 10 && (beatInBar === 2 || beatInBar === 10)) {
                offlineSnare.volume.value = -20;
                offlineSnare.triggerAttackRelease('32n', time);
                offlineSnare.volume.value = -10;
              }
              if (density > 6) {
                offlineHihat.triggerAttackRelease('32n', time);
              } else if (density > 2) {
                if (beatInBar % 2 === 0) offlineHihat.triggerAttackRelease('32n', time);
              } else if (hasNotesHere) {
                offlineHihat.triggerAttackRelease('32n', time);
              }
              if (isBarStart && density > 0 && !(barDensity.get(currentBar - 1) || 0)) {
                offlineCrash.triggerAttackRelease('C4', '4n', time);
              }
            } else if (rhythmMode === 'four-floor') {
              if (beatInBar % 4 === 0) offlineKick.triggerAttackRelease('C1', '8n', time);
              if (beatInBar === 4 || beatInBar === 12) offlineSnare.triggerAttackRelease('16n', time);
              offlineHihat.triggerAttackRelease('32n', time);
              if (isBarStart && hasNotesHere) offlineCrash.triggerAttackRelease('C4', '4n', time);
            } else if (rhythmMode === 'boom-bap') {
              if (beatInBar === 0 || beatInBar === 5 || beatInBar === 10) offlineKick.triggerAttackRelease('C1', '8n', time);
              if (beatInBar === 4 || beatInBar === 12) offlineSnare.triggerAttackRelease('16n', time);
              if (beatInBar % 2 === 0) offlineHihat.triggerAttackRelease('32n', time);
              if (beatInBar === 6 || beatInBar === 14) offlineHihat.triggerAttackRelease('8n', time);
            } else if (rhythmMode === 'ballad') {
              if (beatInBar === 0) offlineKick.triggerAttackRelease('C1', '4n', time);
              if (beatInBar === 8 && hasNotesHere) offlineKick.triggerAttackRelease('C1', '4n', time);
              if (beatInBar === 4 || beatInBar === 12) {
                offlineSnare.volume.value = -16;
                offlineSnare.triggerAttackRelease('8n', time);
                offlineSnare.volume.value = -10;
              }
              if (beatInBar % 4 === 0) offlineHihat.triggerAttackRelease('16n', time);
            }
          }
        }
        
        // 4. Recreate layer Channels & Synths and schedule composition notes
        layers.forEach(layer => {
          if (layer.mute) return;
          
          const offlineChannel = new Tone.Channel({
            volume: layer.volume ?? 0,
            pan: layer.pan ?? 0,
            mute: false,
            solo: false
          }).connect(offlineDistortion);
          
           const instId = layer.instrument?.id || 'acoustic-piano';
          const offlineSynth = createInstrument(instId);
          offlineSynth.disconnect();
          offlineSynth.connect(offlineChannel);
          
          if (offlineSynth && typeof offlineSynth.set === 'function') {
            try {
              offlineSynth.set({
                envelope: {
                  attack: layer.attack ?? 0.01,
                  decay: layer.decay ?? 0.2,
                  sustain: layer.sustain ?? 0.6,
                  release: layer.release ?? 0.8
                }
              });
              if (layer.oscillatorType && layer.instrument?.id !== 'drum-kit') {
                offlineSynth.set({
                  oscillator: {
                    type: layer.oscillatorType
                  }
                });
              }
            } catch {
              // ignore
            }
          }
          
          layer.notes.forEach(note => {
            const time = note.tick * secondsPerTick;
            const noteDuration = note.duration ? (note.duration * secondsPerTick) : (4 * secondsPerTick);
            offlineSynth.triggerAttackRelease(note.name, noteDuration, time);
          });
        });
      }, duration);
      
      setExportProgress(65);
      
      // 5. Encode headless AudioBuffer to raw WAV Binary Blob
      const wavBlob = audioBufferToWav(buffer);
      setExportProgress(90);
      
      // 6. Download wav blob
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `melody-sketch-${Date.now().toString().slice(-6)}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportProgress(100);
      setTimeout(() => setIsExporting(false), 600);
    } catch (err) {
      console.error("Audio Export failed", err);
      alert("Audio offline render failed. Please verify composition settings.");
      setIsExporting(false);
    }
  }, [
    bpm,
    totalTicks,
    layers,
    rhythmMode,
    rhythmMute,
    rhythmVolume,
    reverbLevel,
    delayLevel,
    distortionLevel,
    chorusLevel,
    phaserLevel,
    eqLowLevel,
    eqMidLevel,
    eqHighLevel
  ]);

  return {
    isExporting,
    exportProgress,
    handleMidiUpload,
    exportMidi,
    exportWav
  };
}
