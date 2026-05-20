import { useEffect } from 'react';
import { ALL_NOTES } from '../constants/midiConstants';

export default function useMidiKeyboard({
  activeLayerIdRef,
  isRecordingRef,
  playheadPositionRef,
  addNoteAtRef,
  triggerAttack,
  triggerRelease,
  setActiveKeys,
  setTrackActivity,
  canvasComponentRef
}) {
  useEffect(() => {
    let midiAccessObj = null;

    const onMidiMessage = (message) => {
      const [command, note, velocity] = message.data;
      
      const isNoteOn = (command & 0xf0) === 0x90 && velocity > 0;
      const isNoteOff = (command & 0xf0) === 0x80 || ((command & 0xf0) === 0x90 && velocity === 0);

      const noteObj = ALL_NOTES.find(n => n.midi === note);
      if (!noteObj) return;
      const noteName = noteObj.name;

      const activeLayerId = activeLayerIdRef.current;

      if (isNoteOn) {
        triggerAttack(noteName, activeLayerId);
        setActiveKeys(prev => ({ ...prev, [noteName]: true }));
        setTrackActivity(prev => ({ ...prev, [activeLayerId]: Date.now() }));

        const index = ALL_NOTES.indexOf(noteObj);
        if (canvasComponentRef.current) {
          canvasComponentRef.current.triggerHitParticle(index, activeLayerId);
        }

        if (isRecordingRef.current) {
          addNoteAtRef.current(playheadPositionRef.current, index);
        }
      } else if (isNoteOff) {
        triggerRelease(noteName, activeLayerId);
        setActiveKeys(prev => {
          const next = { ...prev };
          delete next[noteName];
          return next;
        });
      }
    };

    const setupMidiInputs = (midiAccess) => {
      midiAccess.inputs.forEach(input => {
        input.onmidimessage = onMidiMessage;
        console.log(`MIDI Keyboard connected: ${input.name}`);
      });
      midiAccess.onstatechange = (e) => {
        if (e.port.type === 'input') {
          if (e.port.state === 'connected') {
            e.port.onmidimessage = onMidiMessage;
            console.log(`MIDI Keyboard connected: ${e.port.name}`);
          } else if (e.port.state === 'disconnected') {
            console.log(`MIDI Keyboard disconnected: ${e.port.name}`);
          }
        }
      };
    };

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then((access) => {
          midiAccessObj = access;
          setupMidiInputs(access);
        })
        .catch(err => {
          console.warn("MIDI device access not granted:", err);
        });
    }

    return () => {
      if (midiAccessObj) {
        midiAccessObj.inputs.forEach(input => {
          input.onmidimessage = null;
        });
        midiAccessObj.onstatechange = null;
      }
    };
  }, [
    triggerAttack, 
    triggerRelease, 
    activeLayerIdRef, 
    isRecordingRef, 
    playheadPositionRef, 
    addNoteAtRef, 
    setActiveKeys, 
    setTrackActivity, 
    canvasComponentRef
  ]);
}
