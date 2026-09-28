// services/maps.ts — bantu membuat URL Google Maps dari koordinat trip.
import type { GeoPoint, RoutePoint } from '@/types';

// Format koordinat untuk ditampilkan: "−6.200000, 106.816666".
export function formatCoord(p: GeoPoint): string {
  return `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
}

// Buka satu titik di Google Maps (pin lokasi).
export function mapsPointUrl(p: GeoPoint): string {
  return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
}

// Rute lengkap sebagai arah (directions) origin → destination.
// Menyertakan hingga 8 waypoint hasil sampling dari jejak agar bentuk rute terlihat.
export function mapsRouteUrl(
  route: RoutePoint[],
  start?: GeoPoint | null,
  end?: GeoPoint | null,
): string | null {
  const first = route[0];
  const last = route[route.length - 1];
  const origin = start ?? (first ? { lat: first.lat, lng: first.lng } : null);
  const destination = end ?? (last ? { lat: last.lat, lng: last.lng } : null);
  if (!origin || !destination) return null;

  let url =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&travelmode=driving`;

  // Sampling titik tengah jadi waypoint (maks 8 — batas praktis URL Maps).
  const mid = route.slice(1, -1);
  if (mid.length > 0) {
    const MAX = 8;
    const step = Math.max(1, Math.ceil(mid.length / MAX));
    const points = mid
      .filter((_, i) => i % step === 0)
      .slice(0, MAX)
      .map((p) => `${p.lat},${p.lng}`);
    if (points.length > 0) {
      url += `&waypoints=${encodeURIComponent(points.join('|'))}`;
    }
  }

  return url;
}
