import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  LogOut,
  Trophy,
  Award,
  Library,
  Database,
  Trash2,
  Plus,
  Check,
  FolderOpen,
  Heart,
  Globe,
  X,
  Lock,
  Music,
  Disc,
  Clock,
  Mail
} from 'lucide-react';
import { ALL_NOTES, INSTRUMENTS, TRACK_COLORS } from '../constants/midiConstants';
import {
  isFirebaseConfigured,
  auth,
  dbSyncProfile,
  dbFetchProfile,
  dbSaveProject,
  dbFetchProjects,
  dbDeleteProject
} from '../utils/firebaseClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

const COMPOSER_AVATARS = [
  { emoji: '🚀', name: 'Cyber Composer', bg: 'from-cyan-500 to-blue-500' },
  { emoji: '🎸', name: 'Neon Shredder', bg: 'from-pink-500 to-rose-500' },
  { emoji: '🎹', name: 'Synth Wavemaker', bg: 'from-purple-500 to-indigo-500' },
  { emoji: '🎧', name: 'Ambient Architect', bg: 'from-teal-500 to-emerald-500' },
  { emoji: '🥁', name: 'Beat Master', bg: 'from-amber-500 to-orange-500' }
];

const LEVEL_TITLES = [
  'Bedroom Producer', // Lvl 1
  'Synth Initiate',    // Lvl 2
  'Beat Hacker',       // Lvl 3
  'Audio Chemist',     // Lvl 4
  'Wave Crafter',      // Lvl 5
  'Sound Architect',   // Lvl 6
  'Melody Maestro',    // Lvl 7
  'Cyber Legend'       // Lvl 8+
];

// Helper to create pre-defined MIDI notes for Community tracks
const makeNotes = (notesList) => {
  return notesList.map(({ name, tick }) => {
    const noteObj = ALL_NOTES.find(n => n.name === name);
    if (!noteObj) return null;
    const index = ALL_NOTES.indexOf(noteObj);
    return {
      ...noteObj,
      tick,
      index
    };
  }).filter(Boolean);
};

// Community tracks data (fully functional, importable compositions!)
const COMMUNITY_TEMPLATES = [
  {
    id: 'comm-1',
    name: 'Retro Arcade Chiptune',
    creator: '8bit_hero',
    avatar: '👾',
    likes: 142,
    bpm: 135,
    barCount: 4,
    description: 'Bouncy 8-bit chip groove with fast square pulse arpeggios, basic bass, and synth snare.',
    layers: [
      {
        id: 1,
        name: 'Square Pulse',
        instrument: 'pulse',
        color: '#00f0ff',
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.001,
        decay: 0.15,
        sustain: 0.3,
        release: 0.15,
        cutoff: 12000,
        resonance: 2,
        humanize: false,
        notes: makeNotes([
          { name: 'C5', tick: 0 }, { name: 'E5', tick: 2 }, { name: 'G5', tick: 4 }, { name: 'C6', tick: 6 },
          { name: 'E5', tick: 8 }, { name: 'G5', tick: 10 }, { name: 'C6', tick: 12 }, { name: 'G5', tick: 14 },
          { name: 'D5', tick: 16 }, { name: 'F5', tick: 18 }, { name: 'A5', tick: 20 }, { name: 'D6', tick: 22 },
          { name: 'F5', tick: 24 }, { name: 'A5', tick: 26 }, { name: 'D6', tick: 28 }, { name: 'A5', tick: 30 },
          { name: 'B4', tick: 32 }, { name: 'D5', tick: 34 }, { name: 'G5', tick: 36 }, { name: 'B5', tick: 38 },
          { name: 'D5', tick: 40 }, { name: 'G5', tick: 42 }, { name: 'B5', tick: 44 }, { name: 'G5', tick: 46 },
          { name: 'C5', tick: 48 }, { name: 'E5', tick: 50 }, { name: 'G5', tick: 52 }, { name: 'C6', tick: 54 },
          { name: 'E5', tick: 56 }, { name: 'G5', tick: 58 }, { name: 'C6', tick: 60 }, { name: 'G5', tick: 62 }
        ])
      },
      {
        id: 2,
        name: 'Chiptune Bass',
        instrument: 'pulse',
        color: '#ff3366',
        volume: -3,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.8,
        release: 0.2,
        cutoff: 2000,
        resonance: 1,
        humanize: false,
        notes: makeNotes([
          { name: 'C3', tick: 0 }, { name: 'C3', tick: 4 }, { name: 'C3', tick: 8 }, { name: 'C3', tick: 12 },
          { name: 'D3', tick: 16 }, { name: 'D3', tick: 20 }, { name: 'D3', tick: 24 }, { name: 'D3', tick: 28 },
          { name: 'G2', tick: 32 }, { name: 'G2', tick: 36 }, { name: 'G2', tick: 40 }, { name: 'G2', tick: 44 },
          { name: 'C3', tick: 48 }, { name: 'C3', tick: 52 }, { name: 'C3', tick: 56 }, { name: 'C3', tick: 60 }
        ])
      },
      {
        id: 3,
        name: 'Retro Beat',
        instrument: 'drum-kit',
        color: '#2ebd59',
        volume: -4,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        cutoff: 20000,
        resonance: 1,
        humanize: false,
        notes: makeNotes([
          // Kicks
          { name: 'C1', tick: 0 }, { name: 'C1', tick: 4 }, { name: 'C1', tick: 8 }, { name: 'C1', tick: 12 },
          { name: 'C1', tick: 16 }, { name: 'C1', tick: 20 }, { name: 'C1', tick: 24 }, { name: 'C1', tick: 28 },
          { name: 'C1', tick: 32 }, { name: 'C1', tick: 36 }, { name: 'C1', tick: 40 }, { name: 'C1', tick: 44 },
          { name: 'C1', tick: 48 }, { name: 'C1', tick: 52 }, { name: 'C1', tick: 56 }, { name: 'C1', tick: 60 },
          // Snares
          { name: 'C3', tick: 4 }, { name: 'C3', tick: 12 }, { name: 'C3', tick: 20 }, { name: 'C3', tick: 28 },
          { name: 'C3', tick: 36 }, { name: 'C3', tick: 44 }, { name: 'C3', tick: 52 }, { name: 'C3', tick: 60 },
          // Hihats
          { name: 'C4', tick: 2 }, { name: 'C4', tick: 6 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 14 },
          { name: 'C4', tick: 18 }, { name: 'C4', tick: 22 }, { name: 'C4', tick: 26 }, { name: 'C4', tick: 30 },
          { name: 'C4', tick: 34 }, { name: 'C4', tick: 38 }, { name: 'C4', tick: 42 }, { name: 'C4', tick: 46 },
          { name: 'C4', tick: 50 }, { name: 'C4', tick: 54 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 62 }
        ])
      }
    ]
  },
  {
    id: 'comm-2',
    name: 'Late Night Lofi Chords',
    creator: 'lofi_panda',
    avatar: '🐼',
    likes: 289,
    bpm: 82,
    barCount: 4,
    description: 'Warm jazzy electric piano chord progression with slow slide bass and dusty boom-bap rhythm.',
    layers: [
      {
        id: 1,
        name: 'Lo-Fi Chords',
        instrument: 'lofi-keys',
        color: '#ff9f43',
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.05,
        decay: 1.0,
        sustain: 0.8,
        release: 1.2,
        cutoff: 4500,
        resonance: 0.8,
        humanize: true,
        notes: makeNotes([
          // Cmaj7 chord at tick 0
          { name: 'C4', tick: 0 }, { name: 'E4', tick: 0 }, { name: 'G4', tick: 0 }, { name: 'B4', tick: 0 },
          { name: 'C4', tick: 8 }, { name: 'E4', tick: 8 }, { name: 'G4', tick: 8 }, { name: 'B4', tick: 8 },
          // Am7 chord at tick 16
          { name: 'A3', tick: 16 }, { name: 'C4', tick: 16 }, { name: 'E4', tick: 16 }, { name: 'G4', tick: 16 },
          { name: 'A3', tick: 24 }, { name: 'C4', tick: 24 }, { name: 'E4', tick: 24 }, { name: 'G4', tick: 24 },
          // D7 chord at tick 32
          { name: 'D3', tick: 32 }, { name: 'F#3', tick: 32 }, { name: 'A3', tick: 32 }, { name: 'C4', tick: 32 },
          { name: 'D3', tick: 40 }, { name: 'F#3', tick: 40 }, { name: 'A3', tick: 40 }, { name: 'C4', tick: 40 },
          // Gmaj7 chord at tick 48
          { name: 'G3', tick: 48 }, { name: 'B3', tick: 48 }, { name: 'D4', tick: 48 }, { name: 'F#4', tick: 48 },
          { name: 'G3', tick: 56 }, { name: 'B3', tick: 56 }, { name: 'D4', tick: 56 }, { name: 'F#4', tick: 56 }
        ])
      },
      {
        id: 2,
        name: 'Lofi 808 Bass',
        instrument: '808-bass',
        color: '#ff3366',
        volume: -4,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.1,
        decay: 0.8,
        sustain: 0.5,
        release: 0.8,
        cutoff: 800,
        resonance: 1,
        humanize: false,
        notes: makeNotes([
          { name: 'C3', tick: 0 }, { name: 'C3', tick: 8 },
          { name: 'A2', tick: 16 }, { name: 'A2', tick: 24 },
          { name: 'D3', tick: 32 }, { name: 'D3', tick: 40 },
          { name: 'G2', tick: 48 }, { name: 'G2', tick: 56 }
        ])
      },
      {
        id: 3,
        name: 'Lofi Beat',
        instrument: 'drum-kit',
        color: '#3a86ff',
        volume: -5,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        cutoff: 15000,
        resonance: 1,
        humanize: true,
        notes: makeNotes([
          // Kicks
          { name: 'C1', tick: 0 }, { name: 'C1', tick: 10 }, { name: 'C1', tick: 16 }, { name: 'C1', tick: 26 },
          { name: 'C1', tick: 32 }, { name: 'C1', tick: 42 }, { name: 'C1', tick: 48 }, { name: 'C1', tick: 58 },
          // Snares
          { name: 'C3', tick: 4 }, { name: 'C3', tick: 12 }, { name: 'C3', tick: 20 }, { name: 'C3', tick: 28 },
          { name: 'C3', tick: 36 }, { name: 'C3', tick: 44 }, { name: 'C3', tick: 52 }, { name: 'C3', tick: 60 },
          // Hihats
          { name: 'C4', tick: 0 }, { name: 'C4', tick: 2 }, { name: 'C4', tick: 4 }, { name: 'C4', tick: 6 },
          { name: 'C4', tick: 8 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 12 }, { name: 'C4', tick: 14 },
          { name: 'C4', tick: 16 }, { name: 'C4', tick: 18 }, { name: 'C4', tick: 20 }, { name: 'C4', tick: 22 },
          { name: 'C4', tick: 24 }, { name: 'C4', tick: 26 }, { name: 'C4', tick: 28 }, { name: 'C4', tick: 30 },
          { name: 'C4', tick: 32 }, { name: 'C4', tick: 34 }, { name: 'C4', tick: 36 }, { name: 'C4', tick: 38 },
          { name: 'C4', tick: 40 }, { name: 'C4', tick: 42 }, { name: 'C4', tick: 44 }, { name: 'C4', tick: 46 },
          { name: 'C4', tick: 48 }, { name: 'C4', tick: 50 }, { name: 'C4', tick: 52 }, { name: 'C4', tick: 54 },
          { name: 'C4', tick: 56 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 60 }, { name: 'C4', tick: 62 }
        ])
      }
    ]
  },
  {
    id: 'comm-3',
    name: 'Cyberpunk Chase Scene',
    creator: 'neon_runner',
    avatar: '🏍️',
    likes: 412,
    bpm: 120,
    barCount: 4,
    description: 'Intense driving synthwave arpeggio, rapid distorted bassline, and aggressive 808 snare rolls.',
    layers: [
      {
        id: 1,
        name: 'Cyber Lead',
        instrument: 'synth-lead',
        color: '#ff3366',
        volume: -1,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.005,
        decay: 0.2,
        sustain: 0.6,
        release: 0.3,
        cutoff: 8000,
        resonance: 2.5,
        humanize: false,
        notes: makeNotes([
          { name: 'A4', tick: 0 }, { name: 'A4', tick: 2 }, { name: 'C5', tick: 4 }, { name: 'A4', tick: 6 },
          { name: 'D5', tick: 8 }, { name: 'A4', tick: 10 }, { name: 'E5', tick: 12 }, { name: 'D5', tick: 14 },
          { name: 'A4', tick: 16 }, { name: 'A4', tick: 18 }, { name: 'C5', tick: 20 }, { name: 'A4', tick: 22 },
          { name: 'D5', tick: 24 }, { name: 'A4', tick: 26 }, { name: 'E5', tick: 28 }, { name: 'D5', tick: 30 },
          { name: 'G4', tick: 32 }, { name: 'G4', tick: 34 }, { name: 'B4', tick: 36 }, { name: 'G4', tick: 38 },
          { name: 'C5', tick: 40 }, { name: 'G4', tick: 42 }, { name: 'D5', tick: 44 }, { name: 'C5', tick: 46 },
          { name: 'F4', tick: 48 }, { name: 'F4', tick: 50 }, { name: 'A4', tick: 52 }, { name: 'F4', tick: 54 },
          { name: 'B4', tick: 56 }, { name: 'F4', tick: 58 }, { name: 'C5', tick: 60 }, { name: 'B4', tick: 62 }
        ])
      },
      {
        id: 2,
        name: 'Arp Bassline',
        instrument: 'synth-bass',
        color: '#2ebd59',
        volume: -2,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.1,
        cutoff: 1200,
        resonance: 1.5,
        humanize: false,
        notes: makeNotes([
          { name: 'A2', tick: 0 }, { name: 'A2', tick: 2 }, { name: 'A2', tick: 4 }, { name: 'A2', tick: 6 },
          { name: 'A2', tick: 8 }, { name: 'A2', tick: 10 }, { name: 'A2', tick: 12 }, { name: 'A2', tick: 14 },
          { name: 'A2', tick: 16 }, { name: 'A2', tick: 18 }, { name: 'A2', tick: 20 }, { name: 'A2', tick: 22 },
          { name: 'A2', tick: 24 }, { name: 'A2', tick: 26 }, { name: 'A2', tick: 28 }, { name: 'A2', tick: 30 },
          { name: 'G2', tick: 32 }, { name: 'G2', tick: 34 }, { name: 'G2', tick: 36 }, { name: 'G2', tick: 38 },
          { name: 'G2', tick: 40 }, { name: 'G2', tick: 42 }, { name: 'G2', tick: 44 }, { name: 'G2', tick: 46 },
          { name: 'F2', tick: 48 }, { name: 'F2', tick: 50 }, { name: 'F2', tick: 52 }, { name: 'F2', tick: 54 },
          { name: 'F2', tick: 56 }, { name: 'F2', tick: 58 }, { name: 'F2', tick: 60 }, { name: 'F2', tick: 62 }
        ])
      },
      {
        id: 3,
        name: 'Trap Kit',
        instrument: 'drum-kit',
        color: '#00f0ff',
        volume: -4,
        pan: 0,
        mute: false,
        solo: false,
        attack: 0.01,
        decay: 0.1,
        sustain: 0,
        release: 0.1,
        cutoff: 20000,
        resonance: 1,
        humanize: false,
        notes: makeNotes([
          // Kicks
          { name: 'C1', tick: 0 }, { name: 'C1', tick: 6 }, { name: 'C1', tick: 16 }, { name: 'C1', tick: 22 },
          { name: 'C1', tick: 32 }, { name: 'C1', tick: 38 }, { name: 'C1', tick: 48 }, { name: 'C1', tick: 54 },
          // Snares
          { name: 'C3', tick: 8 }, { name: 'C3', tick: 24 }, { name: 'C3', tick: 40 }, { name: 'C3', tick: 56 },
          // Hihat rolls
          { name: 'C4', tick: 0 }, { name: 'C4', tick: 2 }, { name: 'C4', tick: 4 }, { name: 'C4', tick: 6 },
          { name: 'C4', tick: 8 }, { name: 'C4', tick: 10 }, { name: 'C4', tick: 12 }, { name: 'C4', tick: 14 },
          { name: 'C4', tick: 16 }, { name: 'C4', tick: 18 }, { name: 'C4', tick: 20 }, { name: 'C4', tick: 22 },
          { name: 'C4', tick: 24 }, { name: 'C4', tick: 26 }, { name: 'C4', tick: 28 }, { name: 'C4', tick: 30 },
          { name: 'C4', tick: 32 }, { name: 'C4', tick: 34 }, { name: 'C4', tick: 36 }, { name: 'C4', tick: 38 },
          { name: 'C4', tick: 40 }, { name: 'C4', tick: 42 }, { name: 'C4', tick: 44 }, { name: 'C4', tick: 46 },
          { name: 'C4', tick: 48 }, { name: 'C4', tick: 50 }, { name: 'C4', tick: 52 }, { name: 'C4', tick: 54 },
          { name: 'C4', tick: 56 }, { name: 'C4', tick: 58 }, { name: 'C4', tick: 60 }, { name: 'C4', tick: 62 }
        ])
      }
    ]
  }
];

export default function UserProfileModal({
  isOpen,
  onClose,
  currentTheme,
  getCurrentWorkspaceData,
  onLoadProjectData,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'library', 'community'
  
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auth Form State (Traditional username + avatar class)
  const [usernameInput, setUsernameInput] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Firebase Auth Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Library Projects State
  const [projectNameInput, setProjectNameInput] = useState('');
  const [likedProjects, setLikedProjects] = useState(() => {
    try {
      const likes = localStorage.getItem('melody_sketcher_community_likes');
      return likes ? JSON.parse(likes) : {};
    } catch {
      return {};
    }
  });

  // Load user data and projects on mount or when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setIsLoading(true);
      const profile = await dbFetchProfile();
      const userProjects = await dbFetchProjects();
      
      setUser(profile);
      setProjects(userProjects);
      setIsLoading(false);
    }
    loadData();
  }, [isOpen]);

  // Sync user status helper
  const syncUserStats = useCallback(async (updatedUser) => {
    setUser(updatedUser);
    await dbSyncProfile(updatedUser);
  }, []);

  // Leveling engine check
  const checkLevelUp = useCallback((userData) => {
    let xp = userData.xp;
    let level = userData.level;
    
    // Level scaling: Level * 100 XP required to level up
    while (xp >= level * 100 && level < LEVEL_TITLES.length) {
      xp -= level * 100;
      level += 1;
      showToast(`⚡ LEVEL UP! You are now Level ${level} - "${LEVEL_TITLES[level - 1]}"!`, 'success');
    }
    
    syncUserStats({
      ...userData,
      xp,
      level
    });
  }, [showToast, syncUserStats]);

  // Unified login/register handler
  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isFirebaseConfigured && auth) {
      // Firebase Authenticated Flow
      if (authMode === 'register') {
        if (!usernameInput.trim()) {
          showToast('Please enter a username!', 'error');
          setIsLoading(false);
          return;
        }
        if (!emailInput.trim() || !passwordInput) {
          showToast('Please fill in email and password!', 'error');
          setIsLoading(false);
          return;
        }

        try {
          await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        } catch (err) {
          showToast(err.message, 'error');
          setIsLoading(false);
          return;
        }

        const composerClass = COMPOSER_AVATARS[avatarIndex];
        const newUser = {
          username: usernameInput.trim(),
          avatar: composerClass.emoji,
          avatarClass: composerClass.name,
          xp: 0,
          level: 1,
          notesPlaced: 0,
          notesPlayed: 0,
          projectsSavedCount: 0,
          sessionsCount: 1,
          createdAt: new Date().toLocaleDateString()
        };

        const synced = await dbSyncProfile(newUser);
        setUser(synced ? newUser : null);
        showToast('Registered and logged in successfully!', 'success');
      } else {
        // Login mode
        if (!emailInput.trim() || !passwordInput) {
          showToast('Please enter email and password!', 'error');
          setIsLoading(false);
          return;
        }

        try {
          await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        } catch (err) {
          showToast(err.message, 'error');
          setIsLoading(false);
          return;
        }

        const profile = await dbFetchProfile();
        const userProjects = await dbFetchProjects();
        setUser(profile);
        setProjects(userProjects);
        showToast(`Welcome back, ${profile?.username || 'Producer'}!`, 'success');
      }
    } else {
      // Local Mode Offline Flow
      if (!usernameInput.trim()) {
        showToast('Please enter a username!', 'error');
        setIsLoading(false);
        return;
      }

      const composerClass = COMPOSER_AVATARS[avatarIndex];
      const newUser = {
        username: usernameInput.trim(),
        avatar: composerClass.emoji,
        avatarClass: composerClass.name,
        xp: 0,
        level: 1,
        notesPlaced: 0,
        notesPlayed: 0,
        projectsSavedCount: 0,
        sessionsCount: 1,
        createdAt: new Date().toLocaleDateString()
      };

      setUser(newUser);
      localStorage.setItem('melody_sketcher_user', JSON.stringify(newUser));
      showToast(`Welcome to Melody Sketcher, ${newUser.username}!`, 'success');
    }
    setIsLoading(false);
  }, [usernameInput, avatarIndex, emailInput, passwordInput, authMode, showToast]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    if (confirm('Are you sure you want to sign out? Your saved library projects will remain securely stored.')) {
      setIsLoading(true);
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      setUser(null);
      setProjects([]);
      localStorage.removeItem('melody_sketcher_user');
      localStorage.removeItem('melody_sketcher_user_projects');
      showToast('Logged out successfully.', 'info');
      setIsLoading(false);
    }
  }, [showToast]);

  // Save current workspace as project
  const handleSaveProject = useCallback(async () => {
    if (!user) {
      showToast('You must be signed in to save projects to your library!', 'warning');
      return;
    }

    const name = projectNameInput.trim() || `My Sketch ${projects.length + 1}`;
    const workspaceData = getCurrentWorkspaceData();

    if (!workspaceData) {
      showToast('Error reading workspace composition.', 'error');
      return;
    }

    setIsLoading(true);

    const projectPayload = {
      name,
      data: workspaceData
    };

    const savedResult = await dbSaveProject(projectPayload);
    
    if (savedResult) {
      // Fetch updated projects list
      const updatedList = await dbFetchProjects();
      setProjects(updatedList);

      // Give XP for saving project
      const updatedUser = {
        ...user,
        xp: user.xp + 50,
        projectsSavedCount: (user.projectsSavedCount || 0) + 1
      };
      await syncUserStats(updatedUser);

      setProjectNameInput('');
      showToast(`Project "${name}" saved successfully! (+50 XP)`, 'success');
    } else {
      showToast('Failed to save project. Please check backend config.', 'error');
    }
    
    setIsLoading(false);
  }, [user, projectNameInput, projects, getCurrentWorkspaceData, syncUserStats, showToast]);

  // Load project from library
  const handleLoadProject = useCallback((proj) => {
    if (confirm(`Load "${proj.name}"? This will overwrite your active workspace. Any unsaved edits will be lost.`)) {
      onLoadProjectData(proj.data);
      showToast(`Loaded project "${proj.name}" successfully!`, 'success');
      onClose();
    }
  }, [onLoadProjectData, showToast, onClose]);

  // Delete project from library
  const handleDeleteProject = useCallback(async (id, name) => {
    if (confirm(`Delete project "${name}" permanently?`)) {
      setIsLoading(true);
      const success = await dbDeleteProject(id);
      if (success) {
        const updatedList = await dbFetchProjects();
        setProjects(updatedList);
        showToast('Project deleted.', 'info');
      } else {
        showToast('Failed to delete project.', 'error');
      }
      setIsLoading(false);
    }
  }, [showToast]);

  // Import Community Project
  const handleImportCommunityProject = useCallback((template) => {
    if (confirm(`Import "${template.name}" by ${template.creator}? This will load their multi-track arrangement into your DAW.`)) {
      // Map community simplified instrument tags to fully detailed objects
      const finalLayers = template.layers.map(layer => {
        const matchingInst = INSTRUMENTS.find(i => i.id === layer.instrument) || INSTRUMENTS[0];
        const color = TRACK_COLORS[Math.floor(Math.random() * TRACK_COLORS.length)];
        
        return {
          id: layer.id || Math.random(),
          name: layer.name,
          instrument: matchingInst,
          color: color,
          notes: layer.notes || [],
          volume: layer.volume ?? 0,
          pan: layer.pan ?? 0,
          mute: layer.mute ?? false,
          solo: layer.solo ?? false,
          attack: layer.attack ?? 0.01,
          decay: layer.decay ?? 0.2,
          sustain: layer.sustain ?? 0.6,
          release: layer.release ?? 0.8,
          cutoff: layer.cutoff ?? 20000,
          resonance: layer.resonance ?? 1,
          humanize: layer.humanize ?? false
        };
      });

      const restoredData = {
        themeId: 'cyber-prism',
        bpm: template.bpm,
        masterVolume: 0,
        barCount: template.barCount || 4,
        activeLayerId: 1,
        layers: finalLayers,
        reverbLevel: 0.3,
        delayLevel: 0.15,
        distortionLevel: 0,
        chorusLevel: 0,
        phaserLevel: 0,
        eqLowLevel: 0,
        eqMidLevel: 0,
        eqHighLevel: 0
      };

      onLoadProjectData(restoredData);
      
      if (user) {
        const updatedUser = {
          ...user,
          xp: user.xp + 30
        };
        checkLevelUp(updatedUser);
      }

      showToast(`Successfully imported community project! (+30 XP)`, 'success');
      onClose();
    }
  }, [user, checkLevelUp, onLoadProjectData, onClose, showToast]);

  // Like a community project
  const handleLikeCommunityProject = useCallback((id) => {
    const isLiked = likedProjects[id];
    const updatedLikes = {
      ...likedProjects,
      [id]: !isLiked
    };
    setLikedProjects(updatedLikes);
    localStorage.setItem('melody_sketcher_community_likes', JSON.stringify(updatedLikes));

    if (!isLiked) {
      showToast('Liked community project! 💖', 'info');
      if (user) {
        const updatedUser = { ...user, xp: user.xp + 5 };
        checkLevelUp(updatedUser);
      }
    }
  }, [likedProjects, user, checkLevelUp, showToast]);

  // UI calculations
  const currentTitle = LEVEL_TITLES[user ? Math.min(user.level - 1, LEVEL_TITLES.length - 1) : 0];
  const nextLevelXp = user ? user.level * 100 : 100;
  const xpPercentage = user ? Math.min((user.xp / nextLevelXp) * 100, 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
        {/* Close clickable background overlay */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 15 }}
          className="w-full max-w-[580px] rounded-xl border overflow-hidden relative z-10 glass-dark text-white shadow-[0_24px_80px_rgba(0,0,0,0.95)]"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: `0 0 50px -10px ${currentTheme.color}25, inset 0 1px 0 0 rgba(255,255,255,0.15)`
          }}
        >
          {/* Top Decorative Neon Accent Grid Bar */}
          <div 
            className="h-[3px] w-full"
            style={{
              background: 'linear-gradient(90deg, #ff3366, #ff9f43, #2ebd59, #00f0ff, #ff3366)',
              backgroundSize: '200% 200%',
              animation: 'rainbowBorder 8s linear infinite'
            }}
          />

          {/* Header Panel */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))'
                }}
              >
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-white">
                    Melody Studio Profile
                  </h2>
                  {isFirebaseConfigured ? (
                    <span className="text-[7px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      Cloud Connected
                    </span>
                  ) : (
                    <span className="text-[7px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      Local Mode
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Local Cloud Library & Social Share
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center glass-gloss text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!user ? (
            /* REGISTER / SIGN IN MODE */
            <div className="p-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 mb-4 animate-float">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-[16px] font-extrabold text-white text-center">
                Access Melody Cloud Profile
              </h3>
              <p className="text-[10px] text-slate-400 text-center max-w-[340px] mt-1.5 leading-relaxed">
                {isFirebaseConfigured 
                  ? 'Connect to the cloud to sync your producer profile, save your projects online, and access community sharing!'
                  : 'Log in or create a local profile to unlock custom statistics, save multiple studio files in your library, and share or import community compositions!'}
              </p>

              {/* Firebase auth toggle tabs */}
              {isFirebaseConfigured && (
                <div className="flex bg-white/[0.02] border border-white/10 rounded-xl p-0.5 w-full max-w-[380px] mt-5 gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      authMode === 'login' 
                        ? 'bg-cyan-500 text-black font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      authMode === 'register' 
                        ? 'bg-cyan-500 text-black font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              <form onSubmit={handleAuth} className="w-full max-w-[380px] mt-5 space-y-4">
                {/* Traditional local username OR Firebase registration username */}
                {(!isFirebaseConfigured || authMode === 'register') && (
                  <div>
                    <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1.5">
                      Studio Username
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter artist name..."
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                )}

                {/* Firebase email and password fields */}
                {isFirebaseConfigured && (
                  <>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1.5">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-4 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="yourname@domain.com"
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1.5">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs font-semibold focus:outline-none focus:border-cyan-500/50 focus:bg-black/60 transition-all shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Avatar Class selector */}
                {(!isFirebaseConfigured || authMode === 'register') && (
                  <div>
                    <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase block mb-1.5">
                      Choose Producer Avatar / Class
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {COMPOSER_AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarIndex(idx)}
                          className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            avatarIndex === idx
                              ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10'
                          }`}
                        >
                          <span className="text-xl">{av.emoji}</span>
                          {avatarIndex === idx && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-black stroke-[3.5]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="text-[9px] font-bold text-center mt-2 text-cyan-400 uppercase tracking-widest">
                      {COMPOSER_AVATARS[avatarIndex].name}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : (isFirebaseConfigured ? (authMode === 'login' ? 'Sign In to Cloud' : 'Create Cloud Account') : 'Create Local Profile')}
                </button>
              </form>

              {/* Notice for offline local setup */}
              {!isFirebaseConfigured && (
                <p className="text-[8px] text-slate-500 text-center mt-4 max-w-[280px]">
                  Note: To activate online database syncing, set VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID env variables.
                </p>
              )}
            </div>
          ) : (
            /* SIGNED IN VIEW */
            <>
              {/* Tab Navigation */}
              <div className="flex bg-white/[0.02] border-b border-white/[0.06] p-1 gap-1">
                {[
                  { id: 'profile', label: 'My Profile', icon: Award },
                  { id: 'library', label: 'Cloud Library', icon: Library },
                  { id: 'community', label: 'Community Feed', icon: Globe }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/[0.08] text-white shadow-sm border border-white/5'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" style={isActive ? { color: currentTheme.color } : {}} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="p-6 max-h-[460px] overflow-y-auto no-scrollbar min-h-[380px] flex flex-col justify-between">
                
                {/* TAB: MY PROFILE */}
                {activeTab === 'profile' && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    {/* Producer card */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Trophy className="w-16 h-16 text-indigo-400" />
                      </div>
                      
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-3xl shadow-inner">
                        {user.avatar}
                      </div>

                      <div className="space-y-1 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-black text-white">{user.username}</span>
                          <span className="text-[8px] font-black text-indigo-300 bg-indigo-500/25 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            LVL {user.level}
                          </span>
                        </div>
                        <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
                          {currentTitle}
                        </p>
                        <p className="text-[8px] text-slate-500">
                          PRODUCER CLASS: <span className="font-bold text-slate-400">{user.avatarClass || 'Vanguard'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-1.5 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                      <div className="flex justify-between items-baseline text-[9px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Experience Points (XP)</span>
                        <span className="text-indigo-400 tabular-nums">
                          {user.xp} / {nextLevelXp} XP
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/5 p-0.5 shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 relative"
                          style={{ width: `${xpPercentage}%`, transition: 'width 0.4s ease-out' }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                      <p className="text-[8.5px] text-slate-500 leading-normal pt-1">
                        💡 Level up to unlock creative titles! Earn XP by placing notes (+10), playing previews (+5), rendering audio (+50), and importing templates (+30).
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
                        Realtime Stats
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Cloud Projects Saved', val: projects.length, icon: Database },
                          { label: 'Active Notes Placed', val: user.notesPlaced || 0, icon: Music },
                          { label: 'Live Notes Previewed', val: user.notesPlayed || 0, icon: Disc },
                          { label: 'Composer Member Since', val: user.createdAt || 'May 2026', icon: Clock }
                        ].map((stat, i) => {
                          const StatIcon = stat.icon;
                          return (
                            <div key={i} className="p-3 bg-black/35 border border-white/[0.04] rounded-xl flex items-center gap-3">
                              <StatIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                              <div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                                <span className="text-[12px] font-black text-white block mt-0.5 tabular-nums">{stat.val}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sign out */}
                    <div className="flex justify-end pt-3">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all border border-transparent hover:border-rose-500/20"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out Artist
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB: CLOUD LIBRARY */}
                {activeTab === 'library' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    
                    {/* Save Current composition input card */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                      <label className="text-[9px] font-black text-indigo-400 tracking-widest uppercase block">
                        Save Current Composition State
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={25}
                          value={projectNameInput}
                          onChange={(e) => setProjectNameInput(e.target.value)}
                          placeholder="Project Name (e.g. Synth Sunset)..."
                          className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/20 text-xs font-semibold focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <button
                          onClick={handleSaveProject}
                          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-extrabold text-[9.5px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          Save File
                        </button>
                      </div>
                    </div>

                    {/* Saved Projects list */}
                    <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pr-1">
                      <h4 className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-2">
                        Saved Studio Files ({projects.length})
                      </h4>
                      {projects.length === 0 ? (
                        <div className="p-8 text-center bg-black/35 rounded-xl border border-dashed border-white/5 space-y-2">
                          <Database className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-[10px] text-slate-400">
                            Your library is empty. Save your sketch in the form above!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {projects.map((proj) => (
                            <div
                              key={proj.id}
                              className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-4 hover:border-white/15 hover:bg-black/60 transition-all"
                            >
                              <div className="min-w-0">
                                <span className="text-[11px] font-black text-white block truncate leading-none">
                                  {proj.name}
                                </span>
                                <span className="text-[8px] text-slate-500 block mt-1 leading-none">
                                  Saved {proj.createdAt} • {proj.bpm || proj.data?.bpm || 120} BPM • {proj.barCount || proj.data?.barCount || 4} Bars • {proj.trackCount || proj.data?.layers?.length || 0} Tracks
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleLoadProject(proj)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[9px] font-extrabold uppercase tracking-wide transition-all flex items-center gap-1 cursor-pointer"
                                  title="Load into workspace"
                                >
                                  <FolderOpen className="w-3 h-3" />
                                  Open
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(proj.id, proj.name)}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/10 cursor-pointer"
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: COMMUNITY FEED */}
                {activeTab === 'community' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <h4 className="text-[10px] font-extrabold text-white flex items-center gap-1.5 uppercase">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" /> Community Global Tracks
                      </h4>
                      <p className="text-[8.5px] text-slate-400 leading-normal">
                        Import professional multi-track arrangement templates directly into your DAW! Study, edit, or remix notes to earn XP!
                      </p>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                      {COMMUNITY_TEMPLATES.map((tmpl) => {
                        const isLiked = likedProjects[tmpl.id];
                        return (
                          <div
                            key={tmpl.id}
                            className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl shrink-0">
                                  {tmpl.avatar}
                                </div>
                                <div>
                                  <span className="text-[11px] font-black text-white block leading-none">
                                    {tmpl.name}
                                  </span>
                                  <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-wide block mt-1 leading-none">
                                    @{tmpl.creator} • {tmpl.bpm} BPM • {tmpl.barCount} BARS
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleLikeCommunityProject(tmpl.id)}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[8.5px] font-bold uppercase transition-all border cursor-pointer ${
                                    isLiked
                                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                                  <span>{tmpl.likes + (isLiked ? 1 : 0)}</span>
                                </button>
                              </div>
                            </div>

                            <p className="text-[9.5px] text-slate-400 leading-normal">
                              {tmpl.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">LAYERS:</span>
                                <div className="flex gap-1">
                                  {tmpl.layers.map((l, i) => (
                                    <span
                                      key={i}
                                      className="text-[7.5px] font-extrabold px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06]"
                                      style={{ color: l.color }}
                                    >
                                      {l.name}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleImportCommunityProject(tmpl)}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                                Import & Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
  );
}
