import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: "AIzaSyB3ADlb9F6S7wqwJS3I_90EWDFjeDzIr5g",
  authDomain: "canteen-grab-go.firebaseapp.com",
  projectId: "canteen-grab-go",
  storageBucket: "canteen-grab-go.firebasestorage.app",
  messagingSenderId: "639622485470",
  appId: "1:639622485470:web:875806701308157fe6f94f",
  measurementId: "G-E0XZSHLB7G"
};

// Initialize Firebase safely (avoid multi-initialization in HMR / React dev)
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messagingPromise: Promise<Messaging | null> | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => (supported ? getMessaging(firebaseApp) : null))
      .catch(() => null);
  }
  return messagingPromise;
}
