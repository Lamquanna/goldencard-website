// Firebase Configuration for GoldenEnergy SaaS
// This file initializes Firebase services for the application

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import { getAuth, Auth } from 'firebase/auth';

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let messaging: Messaging | null = null;

function initializeFirebase() {
  // Skip initialization if not configured or during SSR build
  if (!isFirebaseConfigured && typeof window === 'undefined') {
    console.warn('Firebase not configured - using mock mode');
    return { app: null, db: null, storage: null, auth: null };
  }
  
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      return { app: null, db: null, storage: null, auth: null };
    }
  } else {
    app = getApps()[0];
  }
  
  if (app) {
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
  
  return { app, db, storage, auth };
}

// Initialize messaging (only in browser and if supported)
async function initializeMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured) return null;
  
  try {
    const supported = await isSupported();
    if (supported && !messaging) {
      const { app: firebaseApp } = initializeFirebase();
      if (firebaseApp) {
        messaging = getMessaging(firebaseApp);
      }
    }
    return messaging;
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error);
    return null;
  }
}

// Export initialized instances
const firebase = initializeFirebase();

export { 
  firebase,
  initializeMessaging,
  isFirebaseConfigured,
};

export const firebaseApp = firebase.app;
export const firestore = firebase.db;
export const firebaseStorage = firebase.storage;
export const firebaseAuth = firebase.auth;

// Helper to get non-null Firestore instance
export function getFirestoreInstance() {
  if (!firebase.db) {
    throw new Error('Firestore is not initialized. Please configure Firebase.');
  }
  return firebase.db;
}

// Helper to get non-null Storage instance
export function getStorageInstance() {
  if (!firebase.storage) {
    throw new Error('Firebase Storage is not initialized. Please configure Firebase.');
  }
  return firebase.storage;
}

// Helper to get non-null App instance
export function getAppInstance() {
  if (!firebase.app) {
    throw new Error('Firebase App is not initialized. Please configure Firebase.');
  }
  return firebase.app;
}

// Collection references
export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  GROUPS: 'groups',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  TYPING: 'typing',
  PRESENCE: 'presence',
} as const;

// Storage paths
export const STORAGE_PATHS = {
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments',
  PROJECT_FILES: 'project-files',
  CHAT_MEDIA: 'chat-media',
} as const;

export default firebase;
