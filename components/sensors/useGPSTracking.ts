// components/sensors/useGPSTracking.ts
// Hook GPS (expo-location): kecepatan real-time (km/h), jarak tempuh (km, haversine),
// lokasi & heading. Minta izin lokasi foreground saat diaktifkan.
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import type { GeoPoint } from '@/types';

export type PermissionStatus = 'pending' | 'granted' | 'denied';

export interface GPSState {
  permission: PermissionStatus;
  speed: number; // km/h
  distance: number; // km (akumulasi)
  location: GeoPoint | null;
  heading: number; // derajat 0–360
  accuracy: number | null; // meter
}

interface Options {
  enabled?: boolean;
}

// Jarak antar dua koordinat (meter) — formula Haversine.
function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000; // radius bumi (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

const INITIAL: GPSState = {
  permission: 'pending',
  speed: 0,
  distance: 0,
  location: null,
  heading: 0,
  accuracy: null,
};

export function useGPSTracking({ enabled = true }: Options = {}) {
  const [state, setState] = useState<GPSState>(INITIAL);
  const lastPoint = useRef<GeoPoint | null>(null);
  const distanceRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setState((s) => ({ ...s, permission: 'denied' }));
        return;
      }
      setState((s) => ({ ...s, permission: 'granted' }));

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // tiap 1 detik
          distanceInterval: 1, // atau tiap 1 meter
        },
        (loc) => {
          const point: GeoPoint = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };

          // Akumulasi jarak (abaikan lonjakan tak wajar > 200m antar sampel).
          if (lastPoint.current) {
            const d = haversineMeters(lastPoint.current, point);
            if (d < 200) distanceRef.current += d;
          }
          lastPoint.current = point;

          // Kecepatan: coords.speed dalam m/s (bisa -1 jika tak tersedia).
          const speedKmh = loc.coords.speed != null && loc.coords.speed > 0
            ? loc.coords.speed * 3.6
            : 0;

          setState({
            permission: 'granted',
            speed: speedKmh,
            distance: distanceRef.current / 1000, // ke km
            location: point,
            heading: loc.coords.heading ?? 0,
            accuracy: loc.coords.accuracy ?? null,
          });
        },
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [enabled]);

  return state;
}
