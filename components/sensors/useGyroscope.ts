// components/sensors/useGyroscope.ts
// Hook Gyroscope (expo-sensors). Nilai dalam rad/s (kecepatan rotasi).
// Normal berkendara < 1.5 rad/s; kecelakaan = rotasi mendadak > threshold.
import { Gyroscope } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export interface GyroData {
  x: number;
  y: number;
  z: number;
  magnitude: number; // sqrt(x²+y²+z²) — total kecepatan rotasi
}

interface Options {
  enabled?: boolean;
  intervalMs?: number;
  onSample?: (data: GyroData) => void;
}

const ZERO: GyroData = { x: 0, y: 0, z: 0, magnitude: 0 };

export function useGyroscope({ enabled = true, intervalMs = 100, onSample }: Options = {}) {
  const [data, setData] = useState<GyroData>(ZERO);
  const onSampleRef = useRef(onSample);
  onSampleRef.current = onSample;

  useEffect(() => {
    if (!enabled) return;

    Gyroscope.setUpdateInterval(intervalMs);
    const sub = Gyroscope.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const sample: GyroData = { x, y, z, magnitude };
      onSampleRef.current?.(sample);
      setData(sample);
    });

    return () => sub.remove();
  }, [enabled, intervalMs]);

  return data;
}
