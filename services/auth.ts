// services/auth.ts — register, login, logout untuk SIPERKASA FAMILY (akun keluarga/admin).
// Memakai Firebase project yang SAMA dengan app Driver, tapi domain email berbeda
// (`@sigapfamily.app`) agar akun keluarga tidak bentrok dengan akun driver (`@sigap.app`).
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const EMAIL_DOMAIN = '@sigapfamily.app';

const usernameToEmail = (username: string) =>
  `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`;

export const registerUser = async (username: string, password: string) => {
  const email = usernameToEmail(username);
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(cred.user, { displayName: username.trim() });

  // Dokumen akun keluarga (terpisah dari koleksi `users` milik driver).
  await setDoc(doc(db, 'familyAccounts', cred.user.uid), {
    username: username.trim(),
    email,
    createdAt: serverTimestamp(),
  });

  return cred.user;
};

export const loginUser = async (username: string, password: string) => {
  const email = usernameToEmail(username);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const logout = () => signOut(auth);

// Terjemahkan kode error Firebase ke Bahasa Indonesia.
export const authErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Username atau password salah.';
    case 'auth/email-already-in-use':
      return 'Username sudah terdaftar. Coba username lain.';
    case 'auth/weak-password':
      return 'Password terlalu lemah (minimal 6 karakter).';
    case 'auth/network-request-failed':
      return 'Gagal terhubung. Periksa koneksi internet.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi nanti.';
    default:
      return 'Terjadi kesalahan. Coba lagi.';
  }
};
