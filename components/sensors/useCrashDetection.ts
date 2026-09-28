// components/sensors/useCrashDetection.ts
// Menjalankan Accelerometer + Gyroscope pada 50Hz (20ms), memproses tiap sampel
// lewat CrashDetector tanpa memicu re-render. Memanggil onCrash saat terdeteksi.
// Mengembalikan magnitude (throttled ~10Hz) untuk ditampilkan.
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { CrashDetector, type CrashEvent } from '@/services/crashDetection';

interface Options {
  enabled?: boolean;
  accelThreshold: number;
  gyroThreshold: number;
  onCrash: (event: CrashEvent) => void;
}

export interface SensorDisplay {
  accelMagnitude: number;
  gyroMagnitude: number;
}

const DETECT_INTERVAL_MS = 20; // 50Hz
const DISPLAY_THROTTLE_MS = 100; // 10Hz untuk tampilan

export function useCrashDetection({ enabled = true, accelThreshold, gyroThreshold, onCrash }: Options) {
  const [display, setDisplay] = useState<SensorDisplay>({ accelMagnitude: 0, gyroMagnitude: 0 });

  const detector = useRef(new CrashDetector({ accelThreshold, gyroThreshold }));
  const gyroMag = useRef(0);
  const lastDisplayAt = useRef(0);
  const onCrashRef = useRef(onCrash);
  onCrashRef.current = onCrash;

  // Sinkronkan threshold bila mode/penempatan berubah.
  useEffect(() => {
    detector.current.setConfig({ accelThreshold, gyroThreshold });
  }, [accelThreshold, gyroThreshold]);

  useEffect(() => {
    if (!enabled) return;
    detector.current.reset();

    Accelerometer.setUpdateInterval(DETECT_INTERVAL_MS);
    Gyroscope.setUpdateInterval(DETECT_INTERVAL_MS);

    const gyroSub = Gyroscope.addListener(({ x, y, z }) => {
      gyroMag.current = Math.sqrt(x * x + y * y + z * z);
    });

    const accelSub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      const event = detector.current.process(mag, gyroMag.current, now);
      if (event) onCrashRef.current?.(event);

      if (now - lastDisplayAt.current >= DISPLAY_THROTTLE_MS) {
        lastDisplayAt.current = now;
        setDisplay({ accelMagnitude: mag, gyroMagnitude: gyroMag.current });
      }
    });

    return () => {
      accelSub.remove();
      gyroSub.remove();
    };
  }, [enabled]);

  return display;
}
