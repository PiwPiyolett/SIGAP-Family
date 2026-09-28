// services/scoreCalculator.ts
// Skor keamanan berkendara 0–100 dari 3 faktor: kecepatan (40%), getaran (40%), insiden (20%).
import { colors } from '@/constants/colors';

export interface ScoreInput {
  overSpeedRatio: number; // 0..1 — porsi waktu melebihi batas kecepatan
  avgVibration: number; // rata-rata |G - 1| (deviasi dari gravitasi); makin besar makin kasar
  incidentCount: number; // jumlah insiden terdeteksi
}

export function hitungSkor({ overSpeedRatio, avgVibration, incidentCount }: ScoreInput): number {
  // Kecepatan (40%): makin sering melebihi batas, makin turun.
  const skorKecepatan = Math.max(0, 100 - overSpeedRatio * 100 * 1.5);

  // Getaran (40%): avgVibration adalah deviasi dari 1G. Faktor 120 dikalibrasi
  // agar 0.1 ≈ −12, 0.3 ≈ −36. (Perlu kalibrasi nyata, seperti threshold.)
  const skorGetaran = Math.max(0, 100 - avgVibration * 120);

  // Insiden (20%): tiap insiden −25.
  const skorInsiden = Math.max(0, 100 - incidentCount * 25);

  return Math.round(skorKecepatan * 0.4 + skorGetaran * 0.4 + skorInsiden * 0.2);
}

export type ScoreStatus = 'aman' | 'hati-hati' | 'berbahaya';

export interface ScoreClass {
  status: ScoreStatus;
  label: string;
  color: string; // warna utama
  gradient: [string, string]; // gradient ring badge
}

export function klasifikasiSkor(score: number): ScoreClass {
  if (score >= 75) {
    return { status: 'aman', label: 'Aman', color: colors.green, gradient: [colors.green, colors.cyan] };
  }
  if (score >= 50) {
    return {
      status: 'hati-hati',
      label: 'Hati-hati',
      color: colors.amber,
      gradient: [colors.amber, '#EF4444'],
    };
  }
  return {
    status: 'berbahaya',
    label: 'Berbahaya',
    color: colors.redSoft,
    gradient: ['#EF4444', colors.red],
  };
}
