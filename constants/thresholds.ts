// constants/thresholds.ts
// Threshold sensor deteksi kecelakaan per kombinasi mode kendaraan & penempatan.
// ⚠️ Nilai ini adalah ESTIMASI AWAL — perlu dikalibrasi dengan pengujian nyata di jalan.
import type { DevicePlacement, VehicleMode } from '@/types';

export interface SensorThreshold {
  accelThreshold: number; // G-force (impact)
  gyroThreshold: number; // rad/s (rotasi mendadak)
}

// Konstanta deteksi umum
export const SENSOR_CONFIG = {
  samplingRateMs: 20, // 50Hz
  freeFallG: 0.3, // di bawah ini dianggap free-fall
  freeFallMinDurationMs: 100, // free-fall minimal agar valid
  impactWindowMs: 2000, // impact harus terjadi <2s setelah free-fall
  normalGyro: 1.5, // rotasi normal berkendara (rad/s)
} as const;

export const THRESHOLDS: Record<VehicleMode, Record<DevicePlacement, SensorThreshold>> = {
  motor: {
    saku: { accelThreshold: 2.5, gyroThreshold: 4.5 },
    tas: { accelThreshold: 3.0, gyroThreshold: 5.0 },
    dasbor: { accelThreshold: 3.5, gyroThreshold: 5.5 },
  },
  mobil: {
    saku: { accelThreshold: 3.0, gyroThreshold: 5.0 },
    tas: { accelThreshold: 3.5, gyroThreshold: 5.5 },
    dasbor: { accelThreshold: 4.0, gyroThreshold: 6.0 },
  },
};

export const getThreshold = (
  mode: VehicleMode,
  placement: DevicePlacement,
): SensorThreshold => THRESHOLDS[mode][placement];

// Batas kecepatan per mode (km/h) — dipakai untuk gauge & skor
export const SPEED_LIMIT: Record<VehicleMode, number> = {
  motor: 60,
  mobil: 80,
};

// Durasi countdown SOS (detik)
export const SOS_COUNTDOWN_SECONDS = 30;
