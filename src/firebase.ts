import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  enableIndexedDbPersistence,
  Timestamp 
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfigData from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore using databaseId if provided
export const db = getFirestore(
  app, 
  firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
    ? firebaseConfigData.firestoreDatabaseId 
    : undefined
);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Attempt anonymous sign in for unauthenticated interactions
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth note (can proceed without):', err.message);
});

// Collection names
export const COLLECTIONS = {
  STUDENTS: 'students',
  BADGES: 'badges',
  AWARDED_BADGES: 'awarded_badges',
  ATTENDANCE: 'attendance_records',
  REDEMPTIONS: 'redemptions',
  SETTINGS: 'teacher_settings'
} as const;

export {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp
};
