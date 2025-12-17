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
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
);

// Log configuration status (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Firebase Configuration Status:', {
    configured: isFirebaseConfigured,
    hasApiKey: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    hasProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    hasAuthDomain: Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  });
}

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
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;
let messagingInstance: Messaging | null = null;

function initializeFirebase() {
  // Skip initialization if not configured or during SSR build
  if (!isFirebaseConfigured && typeof window === 'undefined') {
    console.warn('Firebase not configured - using mock mode');
    return { app: null, db: null, storage: null, auth: null };
  }
  
  if (!getApps().length) {
    try {
      appInstance = initializeApp(firebaseConfig);
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      return { app: null, db: null, storage: null, auth: null };
    }
  } else {
    appInstance = getApps()[0];
  }
  
  if (appInstance) {
    dbInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);
    authInstance = getAuth(appInstance);
  }
  
  return { app: appInstance, db: dbInstance, storage: storageInstance, auth: authInstance };
}

// Initialize messaging (only in browser and if supported)
async function initializeMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured) return null;
  
  try {
    const supported = await isSupported();
    if (supported && !messagingInstance) {
      const { app: firebaseApp } = initializeFirebase();
      if (firebaseApp) {
        messagingInstance = getMessaging(firebaseApp);
      }
    }
    return messagingInstance;
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

// Export named instances for convenience
export const { app, db, storage, auth } = firebase;

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
