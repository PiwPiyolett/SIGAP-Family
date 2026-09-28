// types/index.ts — semua TypeScript interfaces aplikasi SIPERKASA

export type VehicleMode = 'motor' | 'mobil';
export type DevicePlacement = 'saku' | 'tas' | 'dasbor';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface User {
  uid: string;
  username: string;
  email: string;
  createdAt: Date;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // Format: +62xxxxxxxxxx
}

// 'rough_road' = hentakan yang ternyata jalan rusak (kendaraan tetap melaju),
// bukan kecelakaan. Dicatat dari app siswa; ditampilkan terpisah di riwayat.
export type IncidentType = 'freefall_impact' | 'gyro_spike' | 'combined' | 'rough_road';

export interface Incident {
  id: string;
  timestamp: Date;
  type: IncidentType;
  location: GeoPoint;
  sosTriggered: boolean;
  sosCancelled: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  distance: number; // km
  vehicleMode: VehicleMode;
  devicePlacement: DevicePlacement;
  safetyScore: number; // 0-100
  incidentCount: number;
  avgSpeed: number; // km/h rata-rata
  maxSpeed: number; // km/h tertinggi selama perjalanan
  avgVibration: number;
  startAddress: string;
  endAddress: string;
  startLocation: GeoPoint;
  endLocation: GeoPoint;
  incidents: Incident[];
  route: RoutePoint[]; // jejak koordinat selama perjalanan (di-sampling)
}

// Titik rute ringkas yang disimpan ke Firestore (di-sampling tiap ~5 detik).
// Sengaja kompak (tanpa nesting) agar dokumen trip tetap kecil.
export interface RoutePoint {
  lat: number;
  lng: number;
  t: number; // waktu (ms epoch)
  speed: number; // km/h saat titik ini
}

// Titik data yang dikumpulkan tiap 5 detik selama perjalanan aktif
export interface TripDataPoint {
  timestamp: number;
  location: GeoPoint;
  speed: number; // km/h dari expo-location
  vibration: number; // rata-rata accelerometer magnitude
  heading: number; // arah (0–360 derajat)
}

export interface SensorConfig {
  accelThreshold: number; // G-force
  gyroThreshold: number; // rad/s
  samplingRate: number; // ms
}

// Chat AI (Gemini)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: number;
}
