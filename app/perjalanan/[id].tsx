// app/perjalanan/[id].tsx — Detail Perjalanan.
// Dibuka saat sebuah card di tab Riwayat ditekan. Menampilkan ringkasan,
// waktu mulai–selesai, titik koordinat, dan link Google Maps (rute & titik).
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Gauge,
  MapPin,
  Navigation,
  Route as RouteIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { getTrip } from '@/services/firestore';
import { formatCoord, mapsPointUrl, mapsRouteUrl } from '@/services/maps';
import { klasifikasiSkor } from '@/services/scoreCalculator';
import { SPEED_LIMIT } from '@/constants/thresholds';
import type { GeoPoint, Trip } from '@/types';

// Firestore Timestamp / Date / string → Date
function toDate(v: any): Date {
  if (!v) return new Date();
  if (typeof v.toDate === 'function') return v.toDate();
  if (v.seconds != null) return new Date(v.seconds * 1000);
  return new Date(v);
}

function formatTanggal(d: Date): string {
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatJam(d: Date): string {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDurasi(start: Date, end: Date): string {
  const sec = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m ${s}s`;
}

const hasCoord = (p?: GeoPoint | null): p is GeoPoint =>
  !!p && (p.lat !== 0 || p.lng !== 0);

function incidentLabel(type: string): string {
  switch (type) {
    case 'freefall_impact':
      return 'Jatuh + Benturan';
    case 'gyro_spike':
      return 'Putaran Mendadak';
    case 'combined':
      return 'Benturan + Putaran';
    case 'rough_road':
      return 'Jalan Rusak';
    default:
      return 'Insiden';
  }
}

export default function DetailTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getTrip(id)
      .then((t) => active && setTrip(t))
      .catch(() => active && setTrip(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const openUrl = (url: string | null) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen scroll aurora>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Detail Perjalanan</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: spacing.xxl }} />
      ) : !trip ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Perjalanan tidak ditemukan.</Text>
        </View>
      ) : (
        (() => {
          const start = toDate(trip.startTime);
          const end = toDate(trip.endTime);
          const cls = klasifikasiSkor(trip.safetyScore ?? 0);
          const routeUrl = mapsRouteUrl(trip.route ?? [], trip.startLocation, trip.endLocation);
          const points = trip.route?.length ?? 0;

          return (
            <>
              {/* Skor */}
              <View style={[styles.scoreCard, { borderLeftColor: cls.color }]}>
                <ScoreBadge score={trip.safetyScore ?? 0} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.scoreTitle}>
                    Perjalanan {trip.vehicleMode === 'motor' ? 'Motor' : 'Mobil'}
                  </Text>
                  <Text style={styles.scoreSub}>{formatTanggal(start)}</Text>
                  <Text style={[styles.scoreLabel, { color: cls.color }]}>{cls.label}</Text>
                </View>
              </View>

              {/* Waktu */}
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <Clock size={16} color={colors.primaryContainer} strokeWidth={2} />
                  <Text style={styles.cardTitle}>Waktu Perjalanan</Text>
                </View>
                <View style={styles.timeRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>Mulai</Text>
                    <Text style={styles.timeValue}>{formatJam(start)}</Text>
                  </View>
                  <Text style={styles.timeArrow}>→</Text>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>Selesai</Text>
                    <Text style={styles.timeValue}>{formatJam(end)}</Text>
                  </View>
                  <View style={styles.timeCol}>
                    <Text style={styles.timeLabel}>Durasi</Text>
                    <Text style={styles.timeValue}>{formatDurasi(start, end)}</Text>
                  </View>
                </View>
              </View>

              {/* Statistik */}
              <View style={styles.statRow}>
                <View style={styles.statCard}>
                  <Navigation size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
                  <Text style={styles.statValue}>{(trip.distance ?? 0).toFixed(2)}</Text>
                  <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statCard}>
                  <Gauge size={14} color={colors.onSurfaceVariant} strokeWidth={2} />
                  <Text style={styles.statValue}>{(trip.avgSpeed ?? 0).toFixed(0)}</Text>
                  <Text style={styles.statLabel}>km/j rata2</Text>
                </View>
                <View style={styles.statCard}>
                  <AlertTriangle
                    size={14}
                    color={trip.incidentCount > 0 ? colors.redSoft : colors.onSurfaceVariant}
                    strokeWidth={2}
                  />
                  <Text style={styles.statValue}>{trip.incidentCount ?? 0}</Text>
                  <Text style={styles.statLabel}>insiden</Text>
                </View>
              </View>

              {/* Kecepatan tertinggi */}
              {(() => {
                const limit = SPEED_LIMIT[trip.vehicleMode] ?? 0;
                const max = trip.maxSpeed ?? 0;
                const over = limit > 0 && max > limit;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHead}>
                      <Gauge size={16} color={colors.primaryContainer} strokeWidth={2} />
                      <Text style={styles.cardTitle}>Kecepatan Tertinggi</Text>
                    </View>
                    <View style={styles.maxSpeedRow}>
                      <Text
                        style={[styles.maxSpeedValue, { color: over ? colors.redSoft : colors.green }]}
                      >
                        {max.toFixed(0)} <Text style={styles.maxSpeedUnit}>km/j</Text>
                      </Text>
                      <Text
                        style={[
                          styles.maxSpeedTag,
                          { color: over ? colors.redSoft : colors.onSurfaceVariant },
                        ]}
                      >
                        {over ? `Melebihi batas ${limit} km/j` : `Dalam batas (${limit} km/j)`}
                      </Text>
                    </View>
                  </View>
                );
              })()}

              {/* Koordinat & Maps */}
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <MapPin size={16} color={colors.primaryContainer} strokeWidth={2} />
                  <Text style={styles.cardTitle}>Titik Koordinat</Text>
                </View>

                {hasCoord(trip.startLocation) ? (
                  <Pressable
                    style={styles.coordRow}
                    onPress={() => openUrl(mapsPointUrl(trip.startLocation))}
                  >
                    <View style={[styles.coordDot, { backgroundColor: colors.green }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coordLabel}>Titik Awal</Text>
                      <Text style={styles.coordValue}>{formatCoord(trip.startLocation)}</Text>
                    </View>
                    <Text style={styles.coordOpen}>Buka ›</Text>
                  </Pressable>
                ) : null}

                {hasCoord(trip.endLocation) ? (
                  <Pressable
                    style={styles.coordRow}
                    onPress={() => openUrl(mapsPointUrl(trip.endLocation))}
                  >
                    <View style={[styles.coordDot, { backgroundColor: colors.redSoft }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coordLabel}>Titik Akhir</Text>
                      <Text style={styles.coordValue}>{formatCoord(trip.endLocation)}</Text>
                    </View>
                    <Text style={styles.coordOpen}>Buka ›</Text>
                  </Pressable>
                ) : null}

                <View style={styles.routeMeta}>
                  <RouteIcon size={13} color={colors.outline} strokeWidth={2} />
                  <Text style={styles.routeMetaText}>{points} titik rute terekam</Text>
                </View>

                {routeUrl ? (
                  <Button
                    label="🗺️ Buka Rute di Google Maps"
                    onPress={() => openUrl(routeUrl)}
                    style={styles.mapsBtn}
                  />
                ) : (
                  <Text style={styles.noRoute}>Data rute tidak tersedia untuk perjalanan ini.</Text>
                )}
              </View>

              {/* Lokasi insiden */}
              {trip.incidents && trip.incidents.length > 0 ? (
                <View style={styles.card}>
                  <View style={styles.cardHead}>
                    <AlertTriangle size={16} color={colors.redSoft} strokeWidth={2} />
                    <Text style={styles.cardTitle}>Lokasi Insiden ({trip.incidents.length})</Text>
                  </View>
                  {trip.incidents.map((inc) => {
                    const valid = hasCoord(inc.location);
                    return (
                      <Pressable
                        key={inc.id}
                        disabled={!valid}
                        onPress={() => valid && openUrl(mapsPointUrl(inc.location))}
                        style={styles.incidentRow}
                      >
                        <View
                          style={[
                            styles.coordDot,
                            {
                              backgroundColor:
                                inc.type === 'rough_road'
                                  ? colors.cyan
                                  : inc.sosTriggered
                                    ? colors.redSoft
                                    : colors.amber,
                            },
                          ]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.incidentType}>{incidentLabel(inc.type)}</Text>
                          <Text style={styles.incidentMeta}>
                            {formatJam(toDate(inc.timestamp))} ·{' '}
                            {inc.type === 'rough_road'
                              ? 'Jalan rusak (otomatis)'
                              : inc.sosTriggered
                                ? 'SOS terkirim'
                                : inc.sosCancelled
                                  ? 'Dibatalkan (aman)'
                                  : '—'}
                          </Text>
                          {valid ? (
                            <Text style={styles.coordValue}>{formatCoord(inc.location)}</Text>
                          ) : (
                            <Text style={styles.incidentMeta}>Koordinat tidak tersedia</Text>
                          )}
                        </View>
                        {valid ? <Text style={styles.coordOpen}>Buka ›</Text> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </>
          );
        })()
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    backgroundColor: colors.surfaceContainerHigh,
  },
  headerTitle: { ...typography.headlineSm, fontSize: 18, color: colors.onSurface },
  empty: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { ...typography.bodyLg, color: colors.onSurfaceVariant },

  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderLeftWidth: 4,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  scoreTitle: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface },
  scoreSub: { ...typography.bodySm, color: colors.onSurfaceVariant },
  scoreLabel: { ...typography.labelMd, marginTop: 2 },

  card: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardTitle: { ...typography.labelMd, color: colors.onSurfaceVariant },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timeCol: { alignItems: 'center', gap: 2 },
  timeLabel: { ...typography.labelSm, color: colors.outline, fontSize: 10 },
  timeValue: { ...typography.dataLg, fontSize: 18, color: colors.onSurface },
  timeArrow: { ...typography.bodyLg, color: colors.outline },

  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { ...typography.dataLg, color: colors.primaryContainer },
  statLabel: { ...typography.labelSm, color: colors.outline, fontSize: 10 },

  maxSpeedRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  maxSpeedValue: { ...typography.dataLg, fontSize: 28 },
  maxSpeedUnit: { ...typography.labelMd, color: colors.onSurfaceVariant },
  maxSpeedTag: { ...typography.labelSm },

  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  coordDot: { width: 10, height: 10, borderRadius: 5 },
  coordLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  coordValue: { ...typography.bodyMd, color: colors.onSurface, fontFamily: 'JetBrainsMono_500Medium' },
  coordOpen: { ...typography.labelMd, color: colors.primaryContainer },

  routeMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  routeMetaText: { ...typography.bodySm, color: colors.outline },
  mapsBtn: { marginTop: spacing.xs },
  noRoute: { ...typography.bodySm, color: colors.outline, marginTop: spacing.xs },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  incidentType: { ...typography.bodyMd, color: colors.onSurface },
  incidentMeta: { ...typography.bodySm, color: colors.onSurfaceVariant },
});
