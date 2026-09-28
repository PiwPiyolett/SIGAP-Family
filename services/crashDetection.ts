// services/crashDetection.ts
// Algoritma deteksi kecelakaan (logika murni, tanpa UI/sensor).
// Dua pola yang dianggap kecelakaan:
//   1. FREE-FALL diikuti IMPACT keras dalam window 2 detik (mis. motor terjatuh).
//   2. IMPACT keras BERSAMAAN dengan GYRO SPIKE (mis. tabrakan + terpelanting).
// Impact tunggal (tanpa free-fall / tanpa gyro) SENGAJA diabaikan untuk
// menekan false positive dari jalan berlubang. (Lihat brief catatan #7.)
import { SENSOR_CONFIG } from '@/constants/thresholds';
import type { IncidentType } from '@/types';

export interface CrashDetectorConfig {
  accelThreshold: number; // G
  gyroThreshold: number; // rad/s
}

export interface CrashEvent {
  type: IncidentType;
  accelMagnitude: number;
  gyroMagnitude: number;
  timestamp: number;
}

export class CrashDetector {
  private freeFallStart: number | null = null;
  private lastValidFreeFallEnd: number | null = null;
  private config: CrashDetectorConfig;

  constructor(config: CrashDetectorConfig) {
    this.config = config;
  }

  setConfig(config: CrashDetectorConfig) {
    this.config = config;
  }

  reset() {
    this.freeFallStart = null;
    this.lastValidFreeFallEnd = null;
  }

  /**
   * Proses satu sampel sensor (dipanggil ~50Hz).
   * @returns CrashEvent bila terdeteksi, atau null.
   */
  process(accelMag: number, gyroMag: number, now: number = Date.now()): CrashEvent | null {
    const { freeFallG, freeFallMinDurationMs, impactWindowMs } = SENSOR_CONFIG;

    // --- Lacak fase free-fall ---
    if (accelMag < freeFallG) {
      if (this.freeFallStart == null) this.freeFallStart = now;
    } else if (this.freeFallStart != null) {
      // Baru keluar dari free-fall — valid bila durasinya cukup.
      if (now - this.freeFallStart >= freeFallMinDurationMs) {
        this.lastValidFreeFallEnd = now;
      }
      this.freeFallStart = null;
    }

    const impact = accelMag > this.config.accelThreshold;
    const gyroSpike = gyroMag > this.config.gyroThreshold;
    const recentFreeFall =
      this.lastValidFreeFallEnd != null && now - this.lastValidFreeFallEnd <= impactWindowMs;

    // Pola 1: free-fall → impact
    if (impact && recentFreeFall) {
      this.reset();
      return {
        type: gyroSpike ? 'combined' : 'freefall_impact',
        accelMagnitude: accelMag,
        gyroMagnitude: gyroMag,
        timestamp: now,
      };
    }

    // Pola 2: impact + gyro spike bersamaan
    if (impact && gyroSpike) {
      this.reset();
      return {
        type: 'combined',
        accelMagnitude: accelMag,
        gyroMagnitude: gyroMag,
        timestamp: now,
      };
    }

    return null;
  }
}
