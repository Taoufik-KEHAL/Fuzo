import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
// @ts-expect-error -- getReactNativePersistence ships in firebase's React Native
// build and resolves correctly at runtime (Metro follows the "react-native"
// export condition), but firebase's package.json "exports" map resolves
// TypeScript's "types" condition to the web declaration file first, which omits it.
import { getReactNativePersistence, initializeAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';

// Placeholder values — create a Firebase project (console.firebase.google.com),
// register a Web app in it, and swap these for the config it gives you.
// See README.md "Session/user management" for the full walkthrough.
const firebaseConfig = {
  apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
  authDomain: 'REPLACE_WITH_PROJECT_ID.firebaseapp.com',
  projectId: 'REPLACE_WITH_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_PROJECT_ID.appspot.com',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId: 'REPLACE_WITH_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

let sessionPromise: Promise<User> | null = null;

/** Ensures an anonymous Firebase session exists, creating one on first launch. */
export function ensureAnonymousSession(): Promise<User> {
  if (!sessionPromise) {
    sessionPromise = new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            unsubscribe();
            resolve(user);
          }
        },
        reject
      );
      signInAnonymously(auth).catch((error) => {
        unsubscribe();
        sessionPromise = null;
        reject(error);
      });
    });
  }
  return sessionPromise;
}
