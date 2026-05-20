# Melody Sketcher Studio 🎹✨

```text
                     __  __      _            _       
                    |  \/  | ___| | ___   __| |_  _   
                    | |\/| |/ _ \ |/ _ \ / _` | | | |  
                    | |  | |  __/ | (_) | (_| | |_| |  
                    |_|  |_|\___|_|\___/ \__,_|\__, |  
                                               |___/   
                    ____  _        _       _           
                   / ___|| | _____| |_ ___| |__   ___ _ __ 
                   \___ \| |/ / _ \ __/ __| '_ \ / _ \ '__|
                    ___) |   <  __/ || (__| | | |  __/ |   
                   |____/|_|\_\___|\__\___|_| |_|\___|_|   

    +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
    |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
    |   | # |   | # |   |   | # |   | # |   | # |   |   | # |   |
    |   | _ |   | _ |   |   | _ |   | _ |   | _ |   |   | _ |   |
    |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
    | C | D | E | F | G | A | B | C | D | E | F | G | A | B | C |
    +---+---+---+---+---+---+---+---+---+---+---+---+---+---+---+
```

Melody Sketcher Studio is a professional, high-fidelity browser-based and desktop-capable Digital Audio Workstation (DAW) and loop sequencer. Engineered with React 19, Tone.js, Vite, and Framer Motion, it features an optimized HTML5 Canvas sequencing grid, modular subtractive and FM synthesizer engines, a multi-track SSL-style mixing console, real-time master DSP effects, and offline WAV rendering.

---

## 🚀 Exhaustive Feature Descriptions

### 1. 🎛️ Multitrack Sequencer Grid Canvas
The main sequencing editor operates on an optimized HTML5 Canvas rendering thread rather than individual DOM elements, allowing the workstation to process thousands of notes simultaneously without layout lag.
* **Smart Painting**: Clicking a grid cell paints a note. Click-and-dragging allows you to sweep across the grid to paint sequences of notes instantly.
* **Dynamic Eraser**: Right-clicking or double-clicking any note block deletes it.
* **Grid Subdivisions**: The grid is divided into 16th-note ticks (4 ticks per beat) across a selectable loop range (from 1 to 16 bars).
* **Viewport Culling**: Renders only the note nodes within the visible viewport bounds, maximizing browser frame rates.

### 2. 🎚️ ADSR Sound Design & Filter Panel
Each track layer contains a custom synthesizer patch. The **Studio Utilities Dashboard** (openable via the slider icon or `Q` key) lets you program the sound in real time:
* **Attack**: Adjusts the initial volume ramp time (from 1ms for sharp plucks, up to 1.5 seconds for ambient pads).
* **Decay**: Controls the time taken to descend from peak volume to the sustain level.
* **Sustain**: Defines the steady state level (0% to 100%) held while a note is active.
* **Release**: Sets the tail fade-out time (up to 3.5 seconds) after the note finishes.
* **Subtractive Lowpass Filter**: Cutoff Frequency slider sweeps from 80Hz (warm, muffled low-end) to 20,000Hz (crisp highs). The Q Resonance slider controls the band emphasis boost (from 0.1 to 12).

### 3. 🪄 Smart MIDI Snapping & Humanization
* **Pitch Quantize (Scale Snapping)**: Conforms notes on the active layer to a chosen scale. Algorithms scan note frequencies and snap them to the nearest valid note in scales like C Major, A Minor, Pentatonic Major, Pentatonic Minor, or Blues.
* **Time Quantize (Grid Snapping)**: Aligns notes onto Quarter-note, 8th-note, or 16th-note boundaries, snapping tick offsets to mathematical grid cells.
* **Humanization Engine**: 
  * *Live Mode*: Appends non-destructive micro-variations to note playback timing (±12ms) and note velocity (65% to 100%).
  * *Destructive Humanize*: Randomizes note timings and velocity factors directly on the grid.

### 4. 🎚️ SSL-Style Mixer Console
Accessible via the mixer icon in the header or the `M` key.
* **Level Faders**: Fine-tune volume levels from -60dB (silence) to +6dB.
* **Panning Knobs**: Distribute signals across the stereo field from -1 (full Left) to +1 (full Right).
* **Mute & Solo**: Isolate or mute channels. Solo channels automatically mute all other non-soloed tracks.
* **Active VU Meters**: Interactive vertical volume meters dynamically light up and decay to show audio signal amplitude in real time.

### 5. 🎛️ Master FX Processing Chain & live FFT Spectrum Visualizer
All audio outputs route through a master effects pipeline before hitting the main output:
* **Master FX Strip** (Toggle with `X`):
  * **Equalizer (EQ3)**: 3-band shelf EQ with control over Low, Mid, and High frequency bands (from -24dB cut to +12dB boost).
  * **Reverb (JCReverb)**: Simulates acoustic space size.
  * **Echo (FeedbackDelay)**: 8th-note feedback delay.
  * **Grit (Distortion)**: Adds wave-shaping distortion harmonic saturation.
  * **Chorus & Phaser**: Adds stereo modulation.
* **FFT Spectrum Visualizer**: Renders the master output frequency spectrum on a 32-band canvas. Bass frequencies also trigger a dynamic center glow that pulses to the beat.

### 6. 🎨 Preset Library & Workspace Theme Designer
* **Preset Library**: Populate tracks with chord progressions (e.g. Lofi Chill, Synthwave) or drum patterns (e.g. Boom Bap, Trap).
* **Theme Designer**: Change the aesthetic with standard pre-made themes (Neon, Cyberpunk, Obsidian) or build your own. Interactive color pickers let you select primary and secondary colors to generate HSL themes with glowing accents.

### 7. 📄 Offline Rendering & WAV Export Engine
Melody Sketcher includes a custom offline rendering system:
* **Offline Audio Context**: Spawns an isolated `OfflineAudioContext` at 44.1kHz.
* **DSP Mirroring**: Re-routes active synthesizers, channels, panning, volume, and master FX nodes inside the offline context.
* **Offline Processing**: Schedulers trigger note playheads in memory at maximum speed.
* **WAV Packer**: Compiles raw Float32 PCM samples into a standard RIFF/WAVE container file download.

---

## 🎹 Keyboard Controls & Navigation Reference

### Instrument Audition (QWERTY Keyboard Map)
* **White Keys (Naturals)**: `A` (C4), `S` (D4), `D` (E4), `F` (F4), `G` (G4), `H` (A4), `J` (B4), `K` (C5), `L` (D5), `;` (E5), `'` (F5)
* **Black Keys (Accidentals)**: `W` (C#4), `E` (D#4), `T` (F#4), `Y` (G#4), `U` (A#4), `O` (C#5), `P` (D#5)

### Panel Toggles & Workstation Navigation
* **`Spacebar`**: Toggle Play / Stop Transport
* **`Escape`**: Close all open dashboard overlays (Mixer, Master FX, Dashboard)
* **`Q`**: Toggle Studio Dashboard Customizer Panel
* **`M`**: Toggle Mixer Console Panel
* **`X`**: Toggle Master FX Strip (Reverb, Delay, Distortion)
* **`R`**: Toggle Metronome Click Audio
* **`N` / `V`**: Switch Studio Sequencer and Live Stage views
* **`Digit 1 to 9`**: Select Track Layer 1 through 9
* **`Arrow Left / Right`**: Scrub playhead position backward or forward
* **`Arrow Up / Down`**: Adjust tempo (BPM) up or down by 5 BPM
* **`Ctrl + Z` / `Ctrl + Y`**: Undo / Redo grid edits

---

## 📁 Line-by-Line Codebase Architecture & File System

```text
Melody Sketcher/
│
├── package.json                 # Project manifest containing dependencies, Electron packaging configuration, and build scripts.
├── vite.config.js               # Vite configurations with asset bundling, postcss configurations, and chunk optimizations.
├── tailwind.config.js           # Configuration specifying styling files for utility classes.
├── postcss.config.js            # PostCSS plugin registration mapping Autoprefixer and Tailwind rules.
├── electron.cjs                 # Main Electron process bootstrap. Manages desktop window creation, menu bypass, and hardware acceleration.
├── prebuild.js                  # Automated script executed before builds to terminate stray Electron instances and clean previous build directories.
├── index.html                   # HTML template containing root hooks, Google fonts preloading, and SEO metadata.
│
└── src/
    ├── main.jsx                 # Entry point of the React app. Binds the root App component to the DOM.
    ├── App.jsx                  # Main container wrapping the MelodySketcher workspace in global state hooks.
    ├── index.css                # Global stylesheet defining core custom scrollbars, ADSR fader styles, and peak decay animations.
    │
    ├── components/
    │   ├── MelodySketcher.jsx   # Core controller of the DAW. Integrates all hooks, shortcuts, workspace saves, and overlays.
    │   ├── HeaderBar.jsx        # Top navigation containing presets, theme customizers, file utilities, and manual triggers.
    │   ├── TransportBar.jsx     # Controls loop bounds, play/pause, recording, BPM dials, and WAV export triggers.
    │   ├── TrackTabs.jsx        # Displays tracks with volume indicators, mute/solo flags, and note clear utilities.
    │   ├── SequencerCanvas.jsx  # High-performance HTML5 Canvas component that renders notes, grids, ripples, and playhead lines.
    │   ├── PianoKeys.jsx        # Playable piano roll keyboard displaying QWERTY maps.
    │   ├── MixerConsole.jsx     # SSL-style mixing console containing level sliders, pan knobs, and VU meters.
    │   ├── MasterFxPanel.jsx    # Master FX rack with 3-band parametric EQ, reverb, delay, chorus, phaser, and FFT visualizer.
    │   ├── InstrumentSelector.jsx # Grid menu mapping MIDI tracks to their respective synthesis engine sound programs.
    │   ├── IntroOverlay.jsx     # Interactive landing screen introducing features, shortcuts, and initializing the AudioContext.
    │   ├── InteractiveGuide.jsx # Multi-slide guide walking users through notes, mixes, dashboard tools, and custom themes.
    │   └── UserManual.jsx       # Modal documentation listing hotkeys, ADSR details, and key mappings.
    │
    ├── constants/
    │   └── midiConstants.js     # Global presets including GM instrument definitions, fallback themes, and chord maps.
    │
    ├── hooks/
    │   ├── useAudioEngine.js    # Sets up live routing nodes, synthesis engines, and real-time audio playback.
    │   ├── useAudioExport.js    # Directs offline rendering for exports and structures WAV files.
    │   └── useMidiKeyboard.js   # Binds physical MIDI keyboard controller input directly to Tone.js synth voices.
    │
    └── utils/
        ├── instrumentFactory.js # Houses the 13 customized synthesized audio program profiles.
        └── wavEncoder.js        # Compiles PCM sample arrays into standard RIFF/WAVE files.
```

---

## 🛠️ Complete Local & Build Commands

### 📦 Web Development
To run the project locally in your web browser:
```bash
npm install
npm run dev
```

### 💻 Desktop App Development (Electron)
Launch the application locally in an Electron desktop window:
```bash
npm run electron:dev
```

### 🔨 Desktop App Compilation
Compile the project into production-ready offline binaries:
```bash
npm run electron:build
```
> [!NOTE]
> The build script generates portable and installer executables inside the `dist-desktop/` directory.

---

## 👥 Authors & Credits

* **Felipe Arantes de Almeida** — Lead Architect & Sound Designer
* **Gemini 3.5** — AI Engineering Partner

*Built for high-performance audio, premium design styling, and fluid musical workflow.*
