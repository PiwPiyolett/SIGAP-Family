// components/sensors/useAccelerometer.ts
// Hook Accelerometer (expo-sensors). Nilai dalam satuan G (gravitasi):
// ≈1.0 saat diam, <0.3 saat free-fall, >threshold saat impact keras.
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';

export interface AccelData {
  x: number;
  y: number;
  z: number;
  magnitude: number; // sqrt(x²+y²+z²) — total G-force
}

interface Options {
  enabled?: boolean;
  intervalMs?: number; // default 100ms (10Hz) untuk tampilan; 20ms (50Hz) untuk deteksi
  onSample?: (data: AccelData) => void; // callback per sampel (tanpa re-render)
}

const ZERO: AccelData = { x: 0, y: 0, z: 0, magnitude: 0 };

export function useAccelerometer({ enabled = true, intervalMs = 100, onSample }: Options = {}) {
  const [data, setData] = useState<AccelData>(ZERO);
  const onSampleRef = useRef(onSample);
  onSampleRef.current = onSample;

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(intervalMs);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const sample: AccelData = { x, y, z, magnitude };
      onSampleRef.current?.(sample);
      setData(sample);
    });

    return () => sub.remove();
  }, [enabled, intervalMs]);

  return data;
}
