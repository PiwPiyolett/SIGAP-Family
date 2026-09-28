// services/firebase.ts — inisialisasi Firebase (Auth + Firestore).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
// @ts-expect-error getReactNativePersistence belum di-ekspor di tipe firebase/auth
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.warn(
    '[SIPERKASA] Firebase belum dikonfigurasi. Isi file .env (lihat .env.example) lalu restart `npx expo start --clear`.',
  );
}

// Hindari re-inisialisasi saat Fast Refresh.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth dengan persistensi AsyncStorage agar sesi login tersimpan antar restart.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Sudah diinisialisasi (Fast Refresh) — pakai instance yang ada.
  auth = getAuth(app);
}

export { app, auth };
export const db = getFirestore(app);
