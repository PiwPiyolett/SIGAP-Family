// services/family.ts — manajemen grup keluarga & setting per driver (SIPERKASA Family).
// Terhubung ke Firebase project yang SAMA dengan app Driver.
//
// Skema Firestore:
//   families/{familyId}                         { adminUid, familyName, inviteCode, createdAt }
//   families/{familyId}/members/{driverUid}     { username, addedAt }
//   families/{familyId}/settings/{driverUid}    { speedLimit, gyroSensitivity }
//   users/{uid}                                 (dibuat app Driver) { username, ... }
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Family {
  id: string;
  adminUid: string;
  familyName: string;
  inviteCode: string;
}

export interface FamilyMember {
  driverUid: string;
  username: string;
}

export type GyroSensitivity = 'low' | 'medium' | 'high';

export interface DriverSettings {
  speedLimit: number; // km/h
  gyroSensitivity: GyroSensitivity;
}

export const DEFAULT_SETTINGS: DriverSettings = {
  speedLimit: 80,
  gyroSensitivity: 'medium',
};

// Kode undangan 6 karakter (huruf+angka tanpa yang ambigu).
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Ambil grup milik admin ini; buat otomatis bila belum ada.
export async function ensureFamily(adminUid: string, defaultName: string): Promise<Family> {
  const existing = await getFamilyByAdmin(adminUid);
  if (existing) return existing;

  const inviteCode = generateInviteCode();
  const ref = await addDoc(collection(db, 'families'), {
    adminUid,
    familyName: defaultName,
    inviteCode,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, adminUid, familyName: defaultName, inviteCode };
}

export async function getFamilyByAdmin(adminUid: string): Promise<Family | null> {
  const q = query(collection(db, 'families'), where('adminUid', '==', adminUid), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    adminUid: data.adminUid,
    familyName: data.familyName ?? 'Keluarga Saya',
    inviteCode: data.inviteCode ?? '',
  };
}

export async function renameFamily(familyId: string, familyName: string): Promise<void> {
  await setDoc(doc(db, 'families', familyId), { familyName }, { merge: true });
}

// Daftar driver yang tergabung.
export async function listMembers(familyId: string): Promise<FamilyMember[]> {
  const snap = await getDocs(collection(db, 'families', familyId, 'members'));
  return snap.docs.map((d) => ({
    driverUid: d.id,
    username: (d.data().username as string) ?? d.id,
  }));
}

// Cari driver berdasarkan username (dibuat di app Driver, koleksi users) lalu daftarkan.
export async function addDriverByUsername(
  familyId: string,
  username: string,
): Promise<{ ok: boolean; reason?: string; member?: FamilyMember }> {
  const uname = username.trim();
  if (!uname) return { ok: false, reason: 'Username kosong.' };

  const q = query(collection(db, 'users'), where('username', '==', uname), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    return { ok: false, reason: `Driver "${uname}" tidak ditemukan. Pastikan ia sudah daftar di app SIPERKASA Driver.` };
  }

  const driverUid = snap.docs[0].id;
  await setDoc(doc(db, 'families', familyId, 'members', driverUid), {
    username: uname,
    addedAt: serverTimestamp(),
  });
  // Tautkan familyId ke dokumen driver agar app Driver bisa membaca setting-nya.
  await setDoc(doc(db, 'users', driverUid), { familyId }, { merge: true });
  return { ok: true, member: { driverUid, username: uname } };
}

export async function removeDriver(familyId: string, driverUid: string): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'members', driverUid));
}

// Setting per driver (dibaca app Driver untuk override threshold).
export async function getDriverSettings(
  familyId: string,
  driverUid: string,
): Promise<DriverSettings> {
  const snap = await getDoc(doc(db, 'families', familyId, 'settings', driverUid));
  if (!snap.exists()) return { ...DEFAULT_SETTINGS };
  const d = snap.data();
  return {
    speedLimit: typeof d.speedLimit === 'number' ? d.speedLimit : DEFAULT_SETTINGS.speedLimit,
    gyroSensitivity: (d.gyroSensitivity as GyroSensitivity) ?? DEFAULT_SETTINGS.gyroSensitivity,
  };
}

export async function setDriverSettings(
  familyId: string,
  driverUid: string,
  settings: DriverSettings,
): Promise<void> {
  await setDoc(doc(db, 'families', familyId, 'settings', driverUid), settings, { merge: true });
  // Pastikan driver tertaut ke familyId ini agar app Driver bisa membaca setting-nya.
  await setDoc(doc(db, 'users', driverUid), { familyId }, { merge: true });
}
