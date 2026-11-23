import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';

// Retrieve Firebase credentials from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export let auth = null;
export let db = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('🔥 Firebase database and authentication backend successfully connected!');
  } catch (err) {
    console.error('Error initializing Firebase:', err);
  }
} else {
  console.warn(
    '⚠️ Firebase API Key or Project ID missing in environment variables. Falling back to local Storage-based emulation mode.'
  );
}

// ==========================================
// UNIFIED DATA OPERATIONS WITH FALLBACKS
// ==========================================

// 1. Sync / Save User Profile stats
export async function dbSyncProfile(userData) {
  if (!userData) return null;

  if (isFirebaseConfigured && auth && db) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'profiles', currentUser.uid);
        const payload = {
          username: userData.username,
          avatar: userData.avatar,
          avatarClass: userData.avatarClass || 'Cyber Composer',
          xp: userData.xp || 0,
          level: userData.level || 1,
          notesPlaced: userData.notesPlaced || 0,
          notesPlayed: userData.notesPlayed || 0,
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, payload, { merge: true });
        return { ...userData, ...payload };
      }
    } catch (err) {
      console.error('Error syncing profile to Firebase:', err);
    }
  }

  // Fallback: local storage
  localStorage.setItem('melody_sketcher_user', JSON.stringify(userData));
  return userData;
}

// 2. Fetch User Profile
export async function dbFetchProfile() {
  if (isFirebaseConfigured && auth && db) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            username: data.username,
            avatar: data.avatar,
            avatarClass: data.avatarClass,
            xp: data.xp,
            level: data.level,
            notesPlaced: data.notesPlaced,
            notesPlayed: data.notesPlayed,
            createdAt: currentUser.metadata.creationTime
              ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
              : new Date().toLocaleDateString()
          };
        }
      }
    } catch (err) {
      console.error('Error fetching profile from Firebase:', err);
    }
  }

  // Fallback: local storage
  try {
    const saved = localStorage.getItem('melody_sketcher_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// 3. Save Project (Create or Update)
export async function dbSaveProject({ id, name, data }) {
  const workspaceData = data;
  const bpm = workspaceData.bpm || 120;
  const barCount = workspaceData.barCount || 4;
  const trackCount = workspaceData.layers?.length || 0;

  if (isFirebaseConfigured && auth && db) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const projectsColRef = collection(db, 'projects');
        const payload = {
          userId: currentUser.uid,
          name,
          data: workspaceData,
          bpm,
          barCount,
          trackCount,
          updatedAt: new Date().toISOString()
        };

        if (id && id.length > 10 && !id.startsWith('local_')) {
          // Update existing Firestore project
          const projectDocRef = doc(db, 'projects', id);
          await setDoc(projectDocRef, payload, { merge: true });
          return {
            id,
            name,
            data: workspaceData,
            bpm,
            barCount,
            trackCount,
            updatedAt: new Date().toLocaleString()
          };
        } else {
          // Create new Firestore project
          payload.createdAt = new Date().toISOString();
          const docRef = await addDoc(projectsColRef, payload);
          return {
            id: docRef.id,
            name,
            data: workspaceData,
            bpm,
            barCount,
            trackCount,
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString()
          };
        }
      }
    } catch (err) {
      console.error('Error saving project to Firebase:', err);
    }
  }

  // Fallback: local storage
  try {
    const savedProjects = localStorage.getItem('melody_sketcher_user_projects');
    const projectsList = savedProjects ? JSON.parse(savedProjects) : [];
    
    let targetProject;
    const finalId = id || `local_${Date.now()}`;
    const existingIndex = projectsList.findIndex(p => p.id === finalId);

    if (existingIndex > -1) {
      projectsList[existingIndex] = {
        id: finalId,
        name,
        data: workspaceData,
        bpm,
        barCount,
        trackCount,
        updatedAt: new Date().toLocaleString()
      };
      targetProject = projectsList[existingIndex];
    } else {
      targetProject = {
        id: finalId,
        name,
        data: workspaceData,
        bpm,
        barCount,
        trackCount,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      };
      projectsList.push(targetProject);
    }

    localStorage.setItem('melody_sketcher_user_projects', JSON.stringify(projectsList));
    return targetProject;
  } catch (err) {
    console.error('Local projects fallback save failed:', err);
    return null;
  }
}

// 4. Fetch All Projects
export async function dbFetchProjects() {
  if (isFirebaseConfigured && auth && db) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const projectsColRef = collection(db, 'projects');
        const q = query(
          projectsColRef,
          where('userId', '==', currentUser.uid),
          orderBy('updatedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => {
          const item = docSnap.data();
          return {
            id: docSnap.id,
            name: item.name,
            data: item.data,
            bpm: item.bpm,
            barCount: item.barCount,
            trackCount: item.trackCount,
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : new Date().toLocaleString()
          };
        });
      }
    } catch (err) {
      console.error('Error fetching projects from Firebase:', err);
    }
  }

  // Fallback: local storage
  try {
    const savedProjects = localStorage.getItem('melody_sketcher_user_projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  } catch {
    return [];
  }
}

// 5. Delete Project
export async function dbDeleteProject(id) {
  if (isFirebaseConfigured && auth && db) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser && id && id.length > 10 && !id.startsWith('local_')) {
        const projectDocRef = doc(db, 'projects', id);
        await deleteDoc(projectDocRef);
        return true;
      }
    } catch (err) {
      console.error('Error deleting project from Firebase:', err);
    }
  }

  // Fallback: local storage
  try {
    const savedProjects = localStorage.getItem('melody_sketcher_user_projects');
    if (savedProjects) {
      const projectsList = JSON.parse(savedProjects);
      const filtered = projectsList.filter(p => p.id !== id);
      localStorage.setItem('melody_sketcher_user_projects', JSON.stringify(filtered));
      return true;
    }
  } catch (err) {
    console.error('Local projects fallback delete failed:', err);
  }
  return false;
}
