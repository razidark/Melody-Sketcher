import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  GRID_SUBDIVISIONS,
  TICKS_PER_BEAT,
  ALL_NOTES,
  INSTRUMENTS,
  THEMES,
  TRACK_COLORS,
  KEY_TO_NOTE,
  BASE_BEAT_WIDTH,
  BASE_ROW_HEIGHT
} from '../constants/midiConstants';

import MasterFxPanel from './MasterFxPanel';
import MixerConsole from './MixerConsole';
import InstrumentSelector from './InstrumentSelector';
import HeaderBar from './HeaderBar';
import TrackTabs from './TrackTabs';
import PianoKeys from './PianoKeys';
import TransportBar from './TransportBar';
import IntroOverlay from './IntroOverlay';
import SequencerCanvas from './SequencerCanvas';
import StudioDashboard from './StudioDashboard';
import InteractiveGuide from './InteractiveGuide';
import UserManual from './UserManual';
import UserProfileModal from './UserProfileModal';
import { ToastContainer } from './Toast';
import { useToast } from '../hooks/useToast';

import useAudioEngine from '../hooks/useAudioEngine';
import useAudioExport from '../hooks/useAudioExport';
import useMidiKeyboard from '../hooks/useMidiKeyboard';
import useGamepadController from '../hooks/useGamepadController';

export default function MelodySketcher() {
  // In-app toast notification system
  const { toasts, showToast, dismissToast } = useToast();

  // Safe synchronous load of saved workspace
  const savedWorkspace = (() => {
    try {
      const saved = localStorage.getItem('melody_sketcher_workspace');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const [customThemes, setCustomThemes] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(() => THEMES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [masterVolume, setMasterVolume] = useState(0);
  const [barCount, setBarCount] = useState(8);
  const [zoom, setZoom] = useState(1);
  
  // Multi-track state with volume/pan/mute/solo controls
  const [layers, setLayers] = useState([
    { 
      id: 1, 
      name: 'Track 1', 
      instrument: INSTRUMENTS[0], 
      notes: [], 
      color: TRACK_COLORS[0],
      volume: 0, // dB
      pan: 0,    // -1 to 1
      mute: false,
      solo: false,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.6,
      release: 0.8,
      cutoff: 20000,
      resonance: 1,
      humanize: false
    }
  ]);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [rhythmMode, setRhythmMode] = useState('off');
  
  // Drum bus properties for Mixer
  const [rhythmVolume, setRhythmVolume] = useState(-6);
  const [rhythmMute, setRhythmMute] = useState(false);
  const [rhythmSolo, setRhythmSolo] = useState(false);

  // Mixer overlay state
  const [isMixerOpen, setIsMixerOpen] = useState(false);

  // Peak activity and keyboard highlights
  const [trackActivity, setTrackActivity] = useState({});
  const [activeKeys, setActiveKeys] = useState({});
  
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];
  const currentInstrument = activeLayer.instrument;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('melody_sketcher_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const recordNotePlaced = useCallback(() => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        notesPlaced: (prev.notesPlaced || 0) + 1,
        xp: prev.xp + 10
      };
      let xp = updated.xp;
      let level = updated.level;
      while (xp >= level * 100 && level < 8) {
        xp -= level * 100;
        level += 1;
        showToast(`⚡ LEVEL UP! You are now Level ${level}!`, 'success');
      }
      const finalUser = { ...updated, xp, level };
      localStorage.setItem('melody_sketcher_user', JSON.stringify(finalUser));
      return finalUser;
    });
  }, [showToast]);

  const recordNotePlayed = useCallback(() => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        notesPlayed: (prev.notesPlayed || 0) + 1,
        xp: prev.xp + 5
      };
      let xp = updated.xp;
      let level = updated.level;
      while (xp >= level * 100 && level < 8) {
        xp -= level * 100;
        level += 1;
        showToast(`⚡ LEVEL UP! You are now Level ${level}!`, 'success');
      }
      const finalUser = { ...updated, xp, level };
      localStorage.setItem('melody_sketcher_user', JSON.stringify(finalUser));
      return finalUser;
    });
  }, [showToast]);

  const triggerExportMidi = () => {
    exportMidi();
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, xp: prev.xp + 50 };
      let xp = updated.xp;
      let level = updated.level;
      while (xp >= level * 100 && level < 8) {
        xp -= level * 100;
        level += 1;
        showToast(`⚡ LEVEL UP! You are now Level ${level}!`, 'success');
      }
      const finalUser = { ...updated, xp, level };
      localStorage.setItem('melody_sketcher_user', JSON.stringify(finalUser));
      return finalUser;
    });
    showToast("MIDI Exported! +50 XP rewarded.", "success");
  };

  const triggerExportWav = () => {
    exportWav();
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, xp: prev.xp + 50 };
      let xp = updated.xp;
      let level = updated.level;
      while (xp >= level * 100 && level < 8) {
        xp -= level * 100;
        level += 1;
        showToast(`⚡ LEVEL UP! You are now Level ${level}!`, 'success');
      }
      const finalUser = { ...updated, xp, level };
      localStorage.setItem('melody_sketcher_user', JSON.stringify(finalUser));
      return finalUser;
    });
    showToast("WAV Exported! +50 XP rewarded.", "success");
  };

  const setCurrentInstrument = (inst) => {
    setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, instrument: inst } : l));
  };

  const setNotes = useCallback((newNotesOrFn) => {
    setLayers(prev => prev.map(l => {
      if (l.id === activeLayerId) {
        return { ...l, notes: typeof newNotesOrFn === 'function' ? newNotesOrFn(l.notes) : newNotesOrFn };
      }
      return l;
    }));
  }, [activeLayerId]);
  
  const BEAT_WIDTH = BASE_BEAT_WIDTH * zoom;
  const ROW_HEIGHT = BASE_ROW_HEIGHT * zoom;
  const totalTicks = barCount * 4 * GRID_SUBDIVISIONS;

  const [reverbLevel, setReverbLevel] = useState(0.4);
  const [delayLevel, setDelayLevel] = useState(0.2);
  const [distortionLevel, setDistortionLevel] = useState(0);
  const [chorusLevel, setChorusLevel] = useState(0);
  const [phaserLevel, setPhaserLevel] = useState(0);
  const [eqLowLevel, setEqLowLevel] = useState(0);
  const [eqMidLevel, setEqMidLevel] = useState(0);
  const [eqHighLevel, setEqHighLevel] = useState(0);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const playheadPositionRef = useRef(0);
  
  const [gamepadCursor, setGamepadCursor] = useState({ tick: 0, index: 36 });
  const [gamepadConnectedName, setGamepadConnectedName] = useState(null);
  const [isFxOpen, setIsFxOpen] = useState(false);
  const [isInstrumentMenuOpen, setIsInstrumentMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('studio'); // 'studio' or 'stage'
  const [metronome, setMetronome] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(true);

  // Ref to prevent default clean states from overwriting saved workspace immediately
  const hasInitializedRef = useRef(false);

  // Undo/Redo composition state stacks (declared before restoreWorkspace to satisfy ESLint)
  const [history, setHistory] = useState([layers.map(l => ({ id: l.id, notes: l.notes }))]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const getCurrentWorkspaceData = useCallback(() => {
    return {
      themeId: currentTheme.id,
      bpm,
      masterVolume,
      barCount,
      layers: layers.map(l => ({
        id: l.id,
        name: l.name,
        instrument: { id: l.instrument.id },
        notes: l.notes,
        color: l.color,
        volume: l.volume,
        pan: l.pan,
        mute: l.mute,
        solo: l.solo,
        attack: l.attack,
        decay: l.decay,
        sustain: l.sustain,
        release: l.release,
        cutoff: l.cutoff,
        resonance: l.resonance,
        humanize: l.humanize
      })),
      activeLayerId,
      reverbLevel,
      delayLevel,
      distortionLevel,
      chorusLevel,
      phaserLevel,
      eqLowLevel,
      eqMidLevel,
      eqHighLevel
    };
  }, [layers, currentTheme, bpm, masterVolume, barCount, activeLayerId, reverbLevel, delayLevel, distortionLevel, chorusLevel, phaserLevel, eqLowLevel, eqMidLevel, eqHighLevel]);

  const restoreWorkspace = useCallback((saved) => {
    if (!saved) return;
    if (saved.bpm) setBpm(saved.bpm);
    if (typeof saved.masterVolume === 'number') setMasterVolume(saved.masterVolume);
    if (saved.barCount) setBarCount(saved.barCount);
    if (saved.layers && saved.layers.length > 0) {
      const mapped = saved.layers.map(l => {
        const instId = typeof l.instrument === 'object' ? l.instrument?.id : l.instrument;
        const inst = INSTRUMENTS.find(i => i.id === instId) || INSTRUMENTS[0];
        return {
          id: l.id || Math.random(),
          name: l.name || 'Track',
          instrument: inst,
          notes: Array.isArray(l.notes) ? l.notes : [],
          color: l.color || TRACK_COLORS[0],
          volume: typeof l.volume === 'number' ? l.volume : 0,
          pan: typeof l.pan === 'number' ? l.pan : 0,
          mute: typeof l.mute === 'boolean' ? l.mute : false,
          solo: typeof l.solo === 'boolean' ? l.solo : false,
          attack: typeof l.attack === 'number' ? l.attack : 0.01,
          decay: typeof l.decay === 'number' ? l.decay : 0.2,
          sustain: typeof l.sustain === 'number' ? l.sustain : 0.6,
          release: typeof l.release === 'number' ? l.release : 0.8,
          cutoff: typeof l.cutoff === 'number' ? l.cutoff : 20000,
          resonance: typeof l.resonance === 'number' ? l.resonance : 1,
          humanize: typeof l.humanize === 'boolean' ? l.humanize : false
        };
      });
      setLayers(mapped);
      setHistory([mapped.map(l => ({ id: l.id, notes: l.notes }))]);
      setHistoryIndex(0);
    }
    if (saved.activeLayerId) setActiveLayerId(saved.activeLayerId);
    if (typeof saved.reverbLevel === 'number') setReverbLevel(saved.reverbLevel);
    if (typeof saved.delayLevel === 'number') setDelayLevel(saved.delayLevel);
    if (typeof saved.distortionLevel === 'number') setDistortionLevel(saved.distortionLevel);
    if (typeof saved.chorusLevel === 'number') setChorusLevel(saved.chorusLevel);
    if (typeof saved.phaserLevel === 'number') setPhaserLevel(saved.phaserLevel);
    if (typeof saved.eqLowLevel === 'number') setEqLowLevel(saved.eqLowLevel);
    if (typeof saved.eqMidLevel === 'number') setEqMidLevel(saved.eqMidLevel);
    if (typeof saved.eqHighLevel === 'number') setEqHighLevel(saved.eqHighLevel);
  }, []);

  const handleLaunchStudio = async (shouldRestore = false) => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
      } catch {
        console.error("Audio Context initialization failed");
      }
    }
    
    if (shouldRestore && savedWorkspace) {
      restoreWorkspace(savedWorkspace);
    } else {
      try {
        localStorage.removeItem('melody_sketcher_workspace');
      } catch {
        // Ignored
      }
    }

    hasInitializedRef.current = true;
    setIsIntroOpen(false);
  };



  // Sync workspace composition edits to local storage
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    try {
      localStorage.setItem('melody_sketcher_workspace', JSON.stringify({
        themeId: currentTheme.id,
        bpm,
        masterVolume,
        barCount,
        layers: layers.map(l => ({
          id: l.id,
          name: l.name,
          instrument: { id: l.instrument.id },
          notes: l.notes,
          color: l.color,
          volume: l.volume,
          pan: l.pan,
          mute: l.mute,
          solo: l.solo,
          attack: l.attack,
          decay: l.decay,
          sustain: l.sustain,
          release: l.release,
          cutoff: l.cutoff,
          resonance: l.resonance,
          humanize: l.humanize
        })),
        activeLayerId,
        reverbLevel,
        delayLevel,
        distortionLevel,
        chorusLevel,
        phaserLevel,
        eqLowLevel,
        eqMidLevel,
        eqHighLevel
      }));
    } catch {
      // Ignored in private browsing
    }

    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    // Push new edit state to history stack
    const currentNotesState = layers.map(l => ({ id: l.id, notes: l.notes }));
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      return [...next, currentNotesState];
    });
    setHistoryIndex(prev => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, currentTheme, bpm, masterVolume, barCount, activeLayerId, reverbLevel, delayLevel, distortionLevel, chorusLevel, phaserLevel, eqLowLevel, eqMidLevel, eqHighLevel]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const prevNotesState = history[historyIndex - 1];
      setLayers(prev => prev.map(l => {
        const matched = prevNotesState.find(p => p.id === l.id);
        return matched ? { ...l, notes: matched.notes } : l;
      }));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setLayers, setHistoryIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextNotesState = history[historyIndex + 1];
      setLayers(prev => prev.map(l => {
        const matched = nextNotesState.find(p => p.id === l.id);
        return matched ? { ...l, notes: matched.notes } : l;
      }));
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setLayers, setHistoryIndex]);

  const clearSketch = useCallback(() => {
    setLayers(prev => {
      const cleared = prev.map(l => ({ ...l, notes: [] }));
      setHistory([cleared.map(l => ({ id: l.id, notes: [] }))]);
      setHistoryIndex(0);
      return cleared;
    });
  }, [setHistory, setHistoryIndex]);

  // Audio Engine Hook integration
  const {
    synthsRef,
    analyserRef,
    kickRef,
    snareRef,
    hihatRef,
    crashRef,
    playNote,
    triggerAttack,
    triggerRelease
  } = useAudioEngine({
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
  });

  // Audio Exporter Hook integration
  const {
    isExporting,
    exportProgress,
    handleMidiUpload,
    exportMidi,
    exportWav
  } = useAudioExport({
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
    setActiveLayerId,
    showToast
  });

  // Interactive component references
  const containerRef = useRef(null);
  const pianoKeysRef = useRef(null);
  const canvasComponentRef = useRef(null);

  // Keyboard lights schedules
  const triggerKeyHighlight = useCallback((noteName, color) => {
    setActiveKeys(prev => ({ ...prev, [noteName]: color || true }));
    setTimeout(() => {
      setActiveKeys(prev => {
        const next = { ...prev };
        delete next[noteName];
        return next;
      });
    }, 250);
  }, []);

  // Paint a note
  const addNoteAt = useCallback((tick, index) => {
    if (Tone.context.state !== 'running') {
      Tone.start().catch(() => {});
    }
    setNotes(prev => {
      if (prev.some(n => n.tick === tick && n.index === index)) return prev;
      const note = ALL_NOTES[index];
      playNote(note.name, activeLayerId, '8n');
      return [...prev, { ...note, tick, index }];
    });
    setTrackActivity(prev => ({ ...prev, [activeLayerId]: Date.now() }));
    recordNotePlaced();
  }, [activeLayerId, setNotes, playNote, recordNotePlaced]);

  // Erase a note
  const eraseNoteAt = useCallback((tick, index) => {
    if (Tone.context.state !== 'running') {
      Tone.start().catch(() => {});
    }
    setNotes(prev => {
      const existing = prev.findIndex(n => n.tick === tick && n.index === index);
      if (existing !== -1) {
        const newNotes = [...prev];
        newNotes.splice(existing, 1);
        return newNotes;
      }
      return prev;
    });
  }, [setNotes]);

  // Clear all notes of the active track
  const clearActiveTrack = useCallback(() => {
    setNotes([]);
  }, [setNotes]);

  // Transpose all notes of the active track
  const transposeActiveTrack = useCallback((semitones) => {
    setNotes(prev => {
      return prev.map(note => {
        const newMidi = note.midi + semitones;
        if (newMidi >= 21 && newMidi <= 108) {
          const newIndex = 108 - newMidi;
          return {
            ...note,
            name: ALL_NOTES[newIndex].name,
            midi: newMidi,
            index: newIndex
          };
        }
        return note;
      });
    });
  }, [setNotes]);

  // QWERTY & sidebar playable auditions
  const playNoteForKeyboard = useCallback((noteName) => {
    playNote(noteName, activeLayerId, '8n');
    const layer = layers.find(l => l.id === activeLayerId);
    const layerColor = layer ? layer.color : '#ffffff';
    triggerKeyHighlight(noteName, layerColor);
    setTrackActivity(prev => ({ ...prev, [activeLayerId]: Date.now() }));
    recordNotePlayed();

    const noteObj = ALL_NOTES.find(n => n.name === noteName);
    if (noteObj) {
      const index = ALL_NOTES.indexOf(noteObj);
      if (canvasComponentRef.current) {
        canvasComponentRef.current.triggerHitParticle(index, activeLayerId);
      }

      // Record visual key painting immediately if recording!
      if (isRecording) {
        addNoteAt(playheadPositionRef.current, index);
        if (!isPlaying) {
          // Advance step in step recording
          const nextTick = (playheadPositionRef.current + 1) % totalTicks;
          playheadPositionRef.current = nextTick;
          setPlayheadPosition(nextTick);
          
          updatePlayheadDOM(nextTick);
        }
      }
    }
  }, [activeLayerId, isRecording, isPlaying, totalTicks, triggerKeyHighlight, playNote, addNoteAt, layers, recordNotePlayed]);

  // Playback Toggle
  const togglePlay = useCallback(async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    
    if (isPlaying) {
      Tone.Transport.stop();
      setIsPlaying(false);
      setPlayheadPosition(playheadPositionRef.current);
    } else {
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Seek by seconds
  const seekSeconds = useCallback(async (deltaSeconds) => {
    if (Tone.context.state !== 'running') await Tone.start();
    
    const currentTick = playheadPositionRef.current;
    const beatDuration = 60 / bpm;
    const currentTickSeconds = (currentTick / 4) * beatDuration;
    
    let targetSeconds = currentTickSeconds + deltaSeconds;
    const totalSeconds = (totalTicks / 4) * beatDuration;
    
    // Wrap around boundaries
    targetSeconds = (targetSeconds % totalSeconds + totalSeconds) % totalSeconds;
    
    Tone.Transport.seconds = targetSeconds;
    
    const targetTick = Math.round((targetSeconds / beatDuration) * 4) % totalTicks;
    playheadPositionRef.current = targetTick;
    setPlayheadPosition(targetTick);
    
    updatePlayheadDOM(targetTick);
  }, [bpm, totalTicks]);

  // Scrub Playhead directly to tick
  const scrubPlayhead = useCallback(async (tick) => {
    if (Tone.context.state !== 'running') await Tone.start();
    const targetTick = Math.max(0, Math.min(tick, totalTicks - 1));
    const beatDuration = 60 / bpm;
    const targetSeconds = (targetTick / 4) * beatDuration;
    
    Tone.Transport.seconds = targetSeconds;
    
    playheadPositionRef.current = targetTick;
    setPlayheadPosition(targetTick);
    
    updatePlayheadDOM(targetTick);
  }, [bpm, totalTicks]);

  // Keyboard QWERTY MIDI Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat && !['ArrowLeft', 'ArrowRight'].includes(e.code)) return; // Allow arrow repeat for playhead scrubbing
      
      // Undo/Redo Hotkeys
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (e.code === 'Escape') {
        setIsFxOpen(false);
        setIsInstrumentMenuOpen(false);
        setIsMixerOpen(false);
        setIsDashboardOpen(false);
        setIsManualOpen(false);
        setIsProfileOpen(false);
        return;
      }

      // Play QWERTY note or trigger actions if not typing in input
      if (e.target.tagName !== 'INPUT') {
        // Toggle Panels
        if (e.code === 'KeyQ') {
          e.preventDefault();
          setIsDashboardOpen(prev => !prev);
          setIsFxOpen(false);
          setIsMixerOpen(false);
          return;
        }
        if (e.code === 'KeyM') {
          e.preventDefault();
          setIsMixerOpen(prev => !prev);
          setIsDashboardOpen(false);
          return;
        }
        if (e.code === 'KeyX') {
          e.preventDefault();
          setIsFxOpen(prev => !prev);
          setIsDashboardOpen(false);
          return;
        }
        if (e.code === 'KeyR') {
          e.preventDefault();
          setMetronome(prev => !prev);
          return;
        }
        if (e.code === 'KeyN' || e.code === 'KeyV') {
          e.preventDefault();
          setViewMode(prev => prev === 'studio' ? 'stage' : 'studio');
          return;
        }

        // Track selections (Digit 1-9)
        if (e.code.startsWith('Digit')) {
          const num = parseInt(e.code.replace('Digit', ''), 10);
          if (num >= 1 && num <= 9) {
            const targetTrack = layersRef.current[num - 1];
            if (targetTrack) {
              e.preventDefault();
              setActiveLayerId(targetTrack.id);
            }
          }
        }

        // Playhead scrubbing (ArrowLeft/Right)
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          const nextTick = (playheadPositionRef.current + 1) % totalTicksRef.current;
          scrubPlayhead(nextTick);
          return;
        }
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          const prevTick = (playheadPositionRef.current - 1 + totalTicksRef.current) % totalTicksRef.current;
          scrubPlayhead(prevTick);
          return;
        }

        // Tempo adjustment (ArrowUp/Down)
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          setBpm(prev => Math.min(prev + 5, 240));
          return;
        }
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          setBpm(prev => Math.max(prev - 5, 40));
          return;
        }

        const noteName = KEY_TO_NOTE[e.code];
        if (noteName) {
          e.preventDefault();
          playNoteForKeyboard(noteName);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNoteForKeyboard, handleUndo, handleRedo, setMetronome, setViewMode, setActiveLayerId, setBpm, setPlayheadPosition, scrubPlayhead, setIsManualOpen, setIsProfileOpen]);

  // Keep stable refs to avoid canceling and rescheduling the Tone.js transport loop
  const rhythmModeRef = useRef(rhythmMode);
  const activeLayerIdRef = useRef(activeLayerId);
  const beatWidthRef = useRef(BEAT_WIDTH);
  const totalTicksRef = useRef(totalTicks);
  const viewModeRef = useRef(viewMode);
  const zoomRef = useRef(zoom);
  const activeKeysRef = useRef(activeKeys);
  const triggerKeyHighlightRef = useRef(triggerKeyHighlight);
  const isRecordingRef = useRef(isRecording);
  const addNoteAtRef = useRef(addNoteAt);
  const metronomeRef = useRef(metronome);
  const layersRef = useRef(layers);
  const isLoopingRef = useRef(isLooping);

  // Sync refs safely in commit phase (avoiding React 19 render-phase ref mutation warning)
  useEffect(() => {
    rhythmModeRef.current = rhythmMode;
    activeLayerIdRef.current = activeLayerId;
    beatWidthRef.current = BEAT_WIDTH;
    totalTicksRef.current = totalTicks;
    viewModeRef.current = viewMode;
    zoomRef.current = zoom;
    activeKeysRef.current = activeKeys;
    triggerKeyHighlightRef.current = triggerKeyHighlight;
    isRecordingRef.current = isRecording;
    addNoteAtRef.current = addNoteAt;
    metronomeRef.current = metronome;
    layersRef.current = layers;
    isLoopingRef.current = isLooping;
  });

  // Helper to update playhead position and sheet progress shading directly in the DOM
  function updatePlayheadDOM(tick) {
    const bw = beatWidthRef.current;
    const playheadEl = document.getElementById('studio-playhead-line');
    if (playheadEl) {
      playheadEl.style.left = `${tick * bw}px`;
    }
    const shadeEl = document.getElementById('studio-playhead-shade');
    if (shadeEl) {
      shadeEl.style.width = `${tick * bw}px`;
    }
    const progressBarEl = document.getElementById('timeline-progress-bar');
    if (progressBarEl) {
      progressBarEl.style.width = `${(tick / totalTicksRef.current) * 100}%`;
    }
  }

  // Music-reactive border glow & scale pulse
  useEffect(() => {
    let animId;
    const run = () => {
      let volumeNorm = 0;
      if (isPlaying && analyserRef && analyserRef.current) {
        try {
          const data = analyserRef.current.getValue();
          let sum = 0;
          let count = 0;
          for (let i = 0; i < data.length; i++) {
            if (data[i] !== undefined && data[i] !== -Infinity) {
              sum += data[i];
              count++;
            }
          }
          const avgDb = count > 0 ? sum / count : -100;
          // Normalize to 0..1 (assuming -100 to 0dB range)
          volumeNorm = Math.max(0, (avgDb + 100) / 100);
        } catch {
          // ignore
        }
      }

      const root = document.documentElement;
      if (root) {
        // Boost slightly for visual feedback
        const intensity = volumeNorm * 1.5;
        root.style.setProperty('--music-glow', `${intensity}`);
        // Subtle scale pulse (between 1.0 and 1.006)
        const scaleVal = 1 + Math.max(0, volumeNorm - 0.4) * 0.012;
        root.style.setProperty('--music-scale', `${scaleVal}`);
      }

      animId = requestAnimationFrame(run);
    };

    run();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, analyserRef]);

  const clickSynthRef = useRef(null);
  useEffect(() => {
    const clickSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
    }).toDestination();
    clickSynth.volume.value = -24;
    clickSynthRef.current = clickSynth;
    return () => {
      clickSynth.dispose();
      clickSynthRef.current = null;
    };
  }, []);

  const tickIndexRef = useRef(new Map());
  const barDensityRef = useRef(new Map());

  // Optimize lookup maps creation
  useEffect(() => {
    const tickIndex = new Map();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const lNotes = layer.notes;
      for (let j = 0; j < lNotes.length; j++) {
        const note = lNotes[j];
        if (!tickIndex.has(note.tick)) tickIndex.set(note.tick, []);
        tickIndex.get(note.tick).push({ 
          layerId: layer.id, 
          name: note.name, 
          tick: note.tick, 
          index: note.index 
        });
      }
    }

    const barDensity = new Map();
    tickIndex.forEach((notes, tick) => {
      const bar = Math.floor(tick / 16);
      barDensity.set(bar, (barDensity.get(bar) || 0) + notes.length);
    });

    tickIndexRef.current = tickIndex;
    barDensityRef.current = barDensity;
  }, [layers]);

  // Sync Transport BPM smoothly without canceling scheduled events
  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  // Sequencer loop (runs once, reads from refs)
  useEffect(() => {
    const repeat = (time) => {
      const ticks = Tone.Transport.getTicksAtTime(time);
      const rawTick = Math.round(ticks / (Tone.Transport.PPQ / TICKS_PER_BEAT));
      
      if (!isLoopingRef.current && rawTick >= totalTicksRef.current) {
        Tone.Draw.schedule(() => {
          setIsPlaying(false);
          Tone.Transport.stop();
          playheadPositionRef.current = 0;
          setPlayheadPosition(0);
          updatePlayheadDOM(0);
        }, time);
        return;
      }

      const currentTick = rawTick % totalTicksRef.current;
      playheadPositionRef.current = currentTick;

      // Update Playhead elements directly in DOM for ultimate performance
      updatePlayheadDOM(currentTick);

      // --- Metronome click generator ---
      if (metronomeRef.current && Tone.Transport.state === 'started' && currentTick % 4 === 0) {
        const isDownbeat = currentTick % 16 === 0;
        if (clickSynthRef.current) {
          clickSynthRef.current.triggerAttackRelease(isDownbeat ? 1000 : 750, '32n', time);
        }
      }

      // --- Rhythm engine drum triggers ---
      const activeRhythmMode = rhythmModeRef.current;
      if (activeRhythmMode !== 'off') {
        const beatInBar = currentTick % 16;
        const currentBar = Math.floor(currentTick / 16);
        const density = barDensityRef.current.get(currentBar) || 0;
        const hasNotesHere = tickIndexRef.current.has(currentTick);
        const isBarStart = beatInBar === 0;

        let triggeredDrum = false;

        if (activeRhythmMode === 'auto') {
          const kickBeats = density > 8 ? [0, 3, 6, 8, 11, 14] : density > 4 ? [0, 6, 8, 14] : [0, 8];
          if (kickBeats.includes(beatInBar) && kickRef.current) {
            kickRef.current.triggerAttackRelease('C1', '8n', time);
            triggeredDrum = true;
          }
          if ((beatInBar === 4 || beatInBar === 12) && snareRef.current) {
            snareRef.current.triggerAttackRelease('16n', time);
            triggeredDrum = true;
          } else if (density > 10 && (beatInBar === 2 || beatInBar === 10) && snareRef.current) {
            snareRef.current.volume.value = -20;
            snareRef.current.triggerAttackRelease('32n', time);
            snareRef.current.volume.value = -10;
            triggeredDrum = true;
          }
          if (density > 6) {
            if (hihatRef.current) { hihatRef.current.triggerAttackRelease('32n', time); triggeredDrum = true; }
          } else if (density > 2) {
            if (beatInBar % 2 === 0 && hihatRef.current) { hihatRef.current.triggerAttackRelease('32n', time); triggeredDrum = true; }
          } else if (hasNotesHere) {
            if (hihatRef.current) { hihatRef.current.triggerAttackRelease('32n', time); triggeredDrum = true; }
          }
          if (isBarStart && density > 0 && !(barDensityRef.current.get(currentBar - 1) || 0) && crashRef.current) {
            crashRef.current.triggerAttackRelease('C4', '4n', time);
            triggeredDrum = true;
          }
        } else if (activeRhythmMode === 'four-floor') {
          if (beatInBar % 4 === 0 && kickRef.current) { kickRef.current.triggerAttackRelease('C1', '8n', time); triggeredDrum = true; }
          if ((beatInBar === 4 || beatInBar === 12) && snareRef.current) { snareRef.current.triggerAttackRelease('16n', time); triggeredDrum = true; }
          if (hihatRef.current) { hihatRef.current.triggerAttackRelease('32n', time); triggeredDrum = true; }
          if (isBarStart && crashRef.current && hasNotesHere) { crashRef.current.triggerAttackRelease('C4', '4n', time); triggeredDrum = true; }
        } else if (activeRhythmMode === 'boom-bap') {
          if ((beatInBar === 0 || beatInBar === 5 || beatInBar === 10) && kickRef.current) { kickRef.current.triggerAttackRelease('C1', '8n', time); triggeredDrum = true; }
          if ((beatInBar === 4 || beatInBar === 12) && snareRef.current) {
            snareRef.current.triggerAttackRelease('16n', time);
            triggeredDrum = true;
          }
          if (beatInBar % 2 === 0 && hihatRef.current) { hihatRef.current.triggerAttackRelease('32n', time); triggeredDrum = true; }
          if ((beatInBar === 6 || beatInBar === 14) && hihatRef.current) { hihatRef.current.triggerAttackRelease('8n', time); triggeredDrum = true; }
        } else if (activeRhythmMode === 'ballad') {
          if (beatInBar === 0 && kickRef.current) { kickRef.current.triggerAttackRelease('C1', '4n', time); triggeredDrum = true; }
          if (beatInBar === 8 && hasNotesHere && kickRef.current) { kickRef.current.triggerAttackRelease('C1', '4n', time); triggeredDrum = true; }
          if ((beatInBar === 4 || beatInBar === 12) && snareRef.current) {
            snareRef.current.volume.value = -16;
            snareRef.current.triggerAttackRelease('8n', time);
            snareRef.current.volume.value = -10;
            triggeredDrum = true;
          }
          if (beatInBar % 4 === 0 && hihatRef.current) { hihatRef.current.triggerAttackRelease('16n', time); triggeredDrum = true; }
        }

        if (triggeredDrum) {
          setTrackActivity(prev => ({ ...prev, rhythm: Date.now() }));
        }
      }

      // O(1) tick notes triggering
      const tickNotes = tickIndexRef.current.get(currentTick);
      if (tickNotes) {
        const byLayer = new Map();
        for (let i = 0; i < tickNotes.length; i++) {
          const tn = tickNotes[i];
          if (!byLayer.has(tn.layerId)) byLayer.set(tn.layerId, []);
          byLayer.get(tn.layerId).push(tn);
        }
        
        byLayer.forEach((notes, layerId) => {
          const synth = synthsRef.current[layerId];
          const layer = layersRef.current ? layersRef.current.find(l => l.id === layerId) : null;
          const layerColor = layer ? layer.color : '#ffffff';

          if (synth && !synth.disposed) {
            const uniqueNotes = [...new Set(notes.map(n => n.name))];
            try {
              if (layer && layer.humanize) {
                const randomTimeOffset = (Math.random() - 0.5) * 0.025;
                const randomVelocity = 0.65 + Math.random() * 0.35;
                synth.triggerAttackRelease(uniqueNotes, '8n', time + randomTimeOffset, randomVelocity);
              } else {
                synth.triggerAttackRelease(uniqueNotes, '8n', time);
              }
            } catch {
              // Ignore disposed nodes
            }
          }
          
          setTrackActivity(prev => ({ ...prev, [layerId]: Date.now() }));
          notes.forEach(n => {
            if (triggerKeyHighlightRef.current) triggerKeyHighlightRef.current(n.name, layerColor);
            if (canvasComponentRef.current) canvasComponentRef.current.triggerHitParticle(n.index, layerId);
          });
          
          if (layerId === activeLayerIdRef.current) {
            for (let k = 0; k < notes.length; k++) {
              if (canvasComponentRef.current) canvasComponentRef.current.triggerSparkle(notes[k].tick, notes[k].index);
            }
          }
        });
      }
    };

    Tone.Transport.scheduleRepeat(repeat, '16n');
    return () => {
      Tone.Transport.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Web MIDI API controller integration for physical keyboards ("wing keyboards")
  useMidiKeyboard({
    activeLayerIdRef,
    isRecordingRef,
    playheadPositionRef,
    addNoteAtRef,
    triggerAttack,
    triggerRelease,
    setActiveKeys,
    setTrackActivity,
    canvasComponentRef
  });

  // Gamepad/Joystick API controller integration
  useGamepadController({
    gamepadCursor,
    setGamepadCursor,
    activeLayerId,
    setActiveLayerId,
    layers,
    setLayers,
    isRecording,
    setIsRecording,
    togglePlay,
    seekSeconds,
    handleUndo,
    handleRedo,
    addNoteAt,
    eraseNoteAt,
    totalTicks,
    setGamepadConnectedName
  });



  // Remove a track
  const removeLayer = (id, e) => {
    e.stopPropagation();
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) {
      const remainingLayer = layers.find(l => l.id !== id);
      if (remainingLayer) {
        setActiveLayerId(remainingLayer.id);
      }
    }
  };

  const fileInputRef = useRef(null);

  return (
    <div 
      className="flex flex-col fixed inset-0 overflow-hidden text-white font-['Outfit'] bg-[#020203] p-4 daw-outer-padding" 
      ref={containerRef}
      onPointerDown={() => {
        if (Tone.context.state !== 'running') {
          Tone.start().catch(err => console.warn("Failed to unlock AudioContext:", err));
        }
      }}
    >
      
      {/* Rainbow border wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-[24px] p-[1.5px] rainbow-wrapper">
        {/* Outer DAW Floating Shell */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-[23px] border border-white/[0.08] bg-zinc-950/20 backdrop-blur-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] relative daw-shell">
      
      {/* CSS hardware accelerated peak decay and dynamic theme overrides */}
      <style>{`
        :root {
          --accent: ${currentTheme.color};
          --accent-glow: ${currentTheme.color}88;
          --glow-color: ${currentTheme.color};
        }
      `}</style>

      {/* Dynamic background ambient glow */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-[2000ms] z-0 opacity-40 blur-[150px]"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.08) 0%, rgba(255, 46, 147, 0.04) 50%, transparent 100%)`
        }}
      />

      {/* Hidden File Input for MIDI uploads */}
      <input 
        type="file" 
        accept=".mid,.midi" 
        ref={fileInputRef} 
        onChange={handleMidiUpload} 
        className="hidden" 
        style={{ display: 'none' }}
      />

      {/* Header bar section */}
      <HeaderBar 
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        barCount={barCount}
        setBarCount={setBarCount}
        zoom={zoom}
        setZoom={setZoom}
        fileInputRef={fileInputRef}
        handleMidiUpload={handleMidiUpload}
        exportMidi={triggerExportMidi}
        exportWav={triggerExportWav}
        currentInstrument={currentInstrument}
        isInstrumentMenuOpen={isInstrumentMenuOpen}
        setIsInstrumentMenuOpen={setIsInstrumentMenuOpen}
        isFxOpen={isFxOpen}
        setIsFxOpen={setIsFxOpen}
        openIntro={() => setIsIntroOpen(true)}
        isDashboardOpen={isDashboardOpen}
        setIsDashboardOpen={setIsDashboardOpen}
        openGuide={() => setIsGuideOpen(true)}
        openManual={() => setIsManualOpen(true)}
        openProfile={() => setIsProfileOpen(true)}
        currentUser={currentUser}
      />

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Interactive Side Piano Roll (Studio mode only) */}
        {viewMode === 'studio' && (
          <PianoKeys 
            ref={pianoKeysRef}
            viewMode={viewMode}
            activeKeys={activeKeys}
            playNoteForKeyboard={playNoteForKeyboard}
            activeLayer={activeLayer}
            ROW_HEIGHT={ROW_HEIGHT}
          />
        )}

        {/* Modular Hardware Grid Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <SequencerCanvas
            ref={canvasComponentRef}
            layers={layers}
            activeLayerId={activeLayerId}
            zoom={zoom}
            viewMode={viewMode}
            playheadPosition={playheadPosition}
            activeKeys={activeKeys}
            currentTheme={currentTheme}
            isPlaying={isPlaying}
            isRecording={isRecording}
            addNoteAt={addNoteAt}
            eraseNoteAt={eraseNoteAt}
            pianoKeysRef={pianoKeysRef}
            totalTicks={totalTicks}
            BEAT_WIDTH={BEAT_WIDTH}
            ROW_HEIGHT={ROW_HEIGHT}
            gamepadCursor={gamepadConnectedName ? gamepadCursor : null}
            scrubPlayhead={scrubPlayhead}
          />
          {/* Floating Mixer Console Console */}
          <AnimatePresence>
            {isMixerOpen && (
              <MixerConsole 
                layers={layers}
                setLayers={setLayers}
                activeLayerId={activeLayerId}
                setActiveLayerId={setActiveLayerId}
                rhythmVolume={rhythmVolume}
                setRhythmVolume={setRhythmVolume}
                rhythmMute={rhythmMute}
                setRhythmMute={setRhythmMute}
                rhythmSolo={rhythmSolo}
                setRhythmSolo={setRhythmSolo}
                masterVolume={masterVolume}
                setMasterVolume={setMasterVolume}
                trackActivity={trackActivity}
                currentTheme={currentTheme}
                setIsInstrumentMenuOpen={setIsInstrumentMenuOpen}
                closeConsole={() => setIsMixerOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Floating Master Visualizer Side Strip */}
        <AnimatePresence>
          {isFxOpen && (
            <MasterFxPanel
              analyserRef={analyserRef}
              reverbLevel={reverbLevel}
              setReverbLevel={setReverbLevel}
              delayLevel={delayLevel}
              setDelayLevel={setDelayLevel}
              distortionLevel={distortionLevel}
              setDistortionLevel={setDistortionLevel}
              chorusLevel={chorusLevel}
              setChorusLevel={setChorusLevel}
              phaserLevel={phaserLevel}
              setPhaserLevel={setPhaserLevel}
              eqLowLevel={eqLowLevel}
              setEqLowLevel={setEqLowLevel}
              eqMidLevel={eqMidLevel}
              setEqMidLevel={setEqMidLevel}
              eqHighLevel={eqHighLevel}
              setEqHighLevel={setEqHighLevel}
              currentTheme={currentTheme}
              closePanel={() => setIsFxOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Studio Utilities Dashboard */}
        <AnimatePresence>
          {isDashboardOpen && (
            <StudioDashboard 
              activeLayer={activeLayer}
              setLayers={setLayers}
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              customThemes={customThemes}
              setCustomThemes={setCustomThemes}
              closeDashboard={() => setIsDashboardOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Floating Instrument Selector Menu */}
        <AnimatePresence>
          {isInstrumentMenuOpen && (
            <InstrumentSelector
              currentInstrument={currentInstrument}
              setCurrentInstrument={setCurrentInstrument}
              currentTheme={currentTheme}
              closeMenu={() => setIsInstrumentMenuOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Multi-track tabs strip */}
      <TrackTabs 
        layers={layers}
        setLayers={setLayers}
        activeLayerId={activeLayerId}
        setActiveLayerId={setActiveLayerId}
        removeLayer={removeLayer}
        trackActivity={trackActivity}
        viewMode={viewMode}
        clearActiveTrack={clearActiveTrack}
        transposeActiveTrack={transposeActiveTrack}
      />

      <TransportBar 
        isPlaying={isPlaying}
        isLooping={isLooping}
        setIsLooping={setIsLooping}
        togglePlay={togglePlay}
        seekSeconds={seekSeconds}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        playheadPosition={playheadPosition}
        totalTicks={totalTicks}
        bpm={bpm}
        setBpm={setBpm}
        zoom={zoom}
        setZoom={setZoom}
        barCount={barCount}
        setBarCount={setBarCount}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        clearSketch={clearSketch}
        rhythmMode={rhythmMode}
        setRhythmMode={setRhythmMode}
        isFxOpen={isFxOpen}
        setIsFxOpen={setIsFxOpen}
        isMixerOpen={isMixerOpen}
        setIsMixerOpen={setIsMixerOpen}
        isInstrumentMenuOpen={isInstrumentMenuOpen}
        setIsInstrumentMenuOpen={setIsInstrumentMenuOpen}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        currentTheme={currentTheme}
        metronome={metronome}
        setMetronome={setMetronome}
        analyserRef={analyserRef}
      />

        </div>
      </div>

      {/* High-Fidelity Rendering Modal Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[999] flex flex-col items-center justify-center gap-6"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(10,5,25,0.95) 0%, rgba(2,2,4,0.97) 70%)' }}
          >
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="rgba(255,255,255,0.04)" strokeWidth="3" fill="none"
                />
                <motion.circle 
                  cx="48" cy="48" r="40" 
                  stroke={currentTheme.color} strokeWidth="3" fill="none"
                  strokeDasharray="251.2"
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: 251.2 - (251.2 * exportProgress) }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                  style={{ filter: `drop-shadow(0 0 8px ${currentTheme.color}80)` }}
                />
              </svg>
              <div className="absolute text-base font-black tracking-wider text-white select-none tabular-nums">
                {Math.round(exportProgress * 100)}%
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">Rendering Audio</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CD-quality stereo WAV</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro Welcome Screen User Guide Overlay */}
      <AnimatePresence>
        {isIntroOpen && (
          <IntroOverlay 
            launchStudio={() => handleLaunchStudio(false)} 
            hasSavedWorkspace={!!savedWorkspace}
            restoreLastSession={() => handleLaunchStudio(true)}
            currentTheme={currentTheme}
          />
        )}
      </AnimatePresence>


      {/* Interactive Guide */}
      <AnimatePresence>
        {isGuideOpen && (
          <InteractiveGuide 
            currentTheme={currentTheme}
            closeGuide={() => setIsGuideOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* User Manual Modal */}
      <AnimatePresence>
        {isManualOpen && (
          <UserManual 
            onClose={() => setIsManualOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          try {
            const saved = localStorage.getItem('melody_sketcher_user');
            setCurrentUser(saved ? JSON.parse(saved) : null);
          } catch {
            // ignore
          }
        }}
        currentTheme={currentTheme}
        getCurrentWorkspaceData={getCurrentWorkspaceData}
        onLoadProjectData={(projData) => {
          restoreWorkspace(projData);
        }}
        showToast={showToast}
      />

      {/* Gamepad Connected Alert Toast */}
      <AnimatePresence>
        {gamepadConnectedName && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl glass-gloss shadow-2xl border border-emerald-500/20"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gamepad Active</span>
              <span className="text-[12px] font-black text-white mt-1 leading-none">
                {gamepadConnectedName.split('(')[0].trim() || 'Controller'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Toast Notifications */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}
