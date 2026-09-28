// services/firestore.ts — CRUD Firestore untuk SIPERKASA.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { EmergencyContact, Trip } from '@/types';

// === Kontak Darurat (disimpan di dokumen users/{uid}) ===

export async function getEmergencyContacts(uid: string): Promise<EmergencyContact[]> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return [];
  return (snap.data().emergencyContacts as EmergencyContact[]) ?? [];
}

export async function saveEmergencyContacts(
  uid: string,
  contacts: EmergencyContact[],
): Promise<void> {
  await setDoc(doc(db, 'users', uid), { emergencyContacts: contacts }, { merge: true });
}

// === Trips ===

export async function saveTrip(trip: Omit<Trip, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'trips'), trip);
  return ref.id;
}

export async function getTrip(id: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, 'trips', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) };
}

export async function getUserTrips(uid: string): Promise<Trip[]> {
  // Tanpa orderBy agar tidak butuh composite index — urutkan di klien.
  const q = query(collection(db, 'trips'), where('userId', '==', uid));
  const snap = await getDocs(q);
  const trips = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }));
  // Terbaru di atas. startTime bisa Firestore Timestamp atau Date.
  const ms = (v: any) => (v?.toDate ? v.toDate().getTime() : new Date(v).getTime());
  return trips.sort((a, b) => ms(b.startTime) - ms(a.startTime));
}

// Hapus satu trip (hanya dipakai app Family / admin).
export async function deleteTrip(id: string): Promise<void> {
  await deleteDoc(doc(db, 'trips', id));
}

// Hapus SEMUA trip milik satu driver. Mengembalikan jumlah yang terhapus.
// Catatan: writeBatch maks 500 operasi; untuk skala saat ini cukup.
export async function deleteAllTrips(uid: string): Promise<number> {
  const q = query(collection(db, 'trips'), where('userId', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}
