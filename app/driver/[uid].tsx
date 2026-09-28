// app/driver/[uid].tsx — Detail driver: atur batas kecepatan & sensitivitas gyro + riwayat trip.
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Gauge, Minus, Plus, Save, Rotate3d, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { deleteAllTrips, deleteTrip, getUserTrips } from '@/services/firestore';
import {
  DEFAULT_SETTINGS,
  getDriverSettings,
  setDriverSettings,
  type DriverSettings,
  type GyroSensitivity,
} from '@/services/family';
import { klasifikasiSkor } from '@/services/scoreCalculator';
import { SPEED_LIMIT } from '@/constants/thresholds';
import type { Trip } from '@/types';

function toDate(v: any): Date {
  if (!v) return new Date();
  if (typeof v.toDate === 'function') return v.toDate();
  if (v.seconds != null) return new Date(v.seconds * 1000);
  return new Date(v);
}
function formatTanggal(d: Date): string {
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDurasi(start: Date, end: Date): string {
  const sec = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

const SPEED_MIN = 20;
const SPEED_MAX = 150;
const SPEED_STEP = 5;

const SENS_OPTIONS: { key: GyroSensitivity; label: string; desc: string }[] = [
  { key: 'low', label: 'Rendah', desc: 'Hanya guncangan besar' },
  { key: 'medium', label: 'Sedang', desc: 'Seimbang (disarankan)' },
  { key: 'high', label: 'Tinggi', desc: 'Peka guncangan kecil' },
];

export default function DriverDetail() {
  const { uid, username, familyId } = useLocalSearchParams<{
    uid: string;
    username: string;
    familyId: string;
  }>();

  const [settings, setSettings] = useState<DriverSettings>(DEFAULT_SETTINGS);
  const [initial, setInitial] = useState<DriverSettings>(DEFAULT_SETTINGS);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid || !familyId) return;
    let active = true;
    setLoading(true);
    Promise.all([getDriverSettings(familyId, uid), getUserTrips(uid)])
      .then(([s, t]) => {
        if (!active) return;
        setSettings(s);
        setInitial(s);
        setTrips(t);
      })
      .catch(() => active && Alert.alert('Gagal memuat', 'Periksa koneksi internet.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [uid, familyId]);

  const dirty =
    settings.speedLimit !== initial.speedLimit ||
    settings.gyroSensitivity !== initial.gyroSensitivity;

  const adjustSpeed = (delta: number) => {
    setSettings((s) => ({
      ...s,
      speedLimit: Math.max(SPEED_MIN, Math.min(SPEED_MAX, s.speedLimit + delta)),
    }));
  };

  const handleSave = async () => {
    if (!dirty || !familyId || !uid) return;
    setSaving(true);
    try {
      await setDriverSettings(familyId, uid, settings);
      setInitial(settings);
      Alert.alert('Tersimpan', `Pengaturan untuk ${username} berhasil disimpan.`);
    } catch {
      Alert.alert('Gagal menyimpan', 'Periksa koneksi internet lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    Alert.alert(
      'Hapus Perjalanan',
      'Hapus satu riwayat perjalanan ini? Tindakan ini tidak bisa dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              setTrips((ts) => ts.filter((t) => t.id !== tripId));
            } catch {
              Alert.alert('Gagal', 'Tidak bisa menghapus. Periksa koneksi internet.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Hapus Semua Riwayat',
      `Hapus SEMUA (${trips.length}) riwayat perjalanan ${username}? Tindakan ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            if (!uid) return;
            try {
              await deleteAllTrips(uid);
              setTrips([]);
            } catch {
              Alert.alert('Gagal', 'Tidak bisa menghapus. Periksa koneksi internet.');
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll aurora>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{username ?? 'Driver'}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primaryContainer} style={{ marginTop: spacing.xxl }} />
      ) : (
        <>
          {/* Batas kecepatan */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Gauge size={16} color={colors.primaryContainer} strokeWidth={2} />
              <Text style={styles.cardTitle}>Batas Kecepatan</Text>
            </View>
            <View style={styles.speedRow}>
              <Pressable
                onPress={() => adjustSpeed(-SPEED_STEP)}
                style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Minus size={22} color={colors.onSurface} strokeWidth={2.5} />
              </Pressable>
              <View style={styles.speedValueWrap}>
                <Text style={styles.speedValue}>{settings.speedLimit}</Text>
                <Text style={styles.speedUnit}>km/jam</Text>
              </View>
              <Pressable
                onPress={() => adjustSpeed(SPEED_STEP)}
                style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Plus size={22} color={colors.onSurface} strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={styles.cardHint}>
              Driver akan diperingatkan saat melebihi batas ini, dan skor keselamatannya menurun.
            </Text>
          </View>

          {/* Sensitivitas gyroscope */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Rotate3d size={16} color={colors.primaryContainer} strokeWidth={2} />
              <Text style={styles.cardTitle}>Sensitivitas Deteksi (Gyroscope)</Text>
            </View>
            <View style={styles.sensRow}>
              {SENS_OPTIONS.map((opt) => {
                const active = settings.gyroSensitivity === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setSettings((s) => ({ ...s, gyroSensitivity: opt.key }))}
                    style={[styles.sensPill, active && styles.sensPillActive]}
                  >
                    <Text style={[styles.sensLabel, active && styles.sensLabelActive]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.cardHint}>
              {SENS_OPTIONS.find((o) => o.key === settings.gyroSensitivity)?.desc}. Makin tinggi,
              makin peka mendeteksi guncangan kecil (bisa lebih sering false alarm).
            </Text>
          </View>

          {/* Tombol simpan */}
          <Pressable
            onPress={handleSave}
            disabled={!dirty || saving}
            style={({ pressed }) => [
              styles.saveBtn,
              { opacity: !dirty ? 0.4 : pressed ? 0.8 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Save size={18} color={colors.background} strokeWidth={2.5} />
                <Text style={styles.saveLabel}>SIMPAN PENGATURAN</Text>
              </>
            )}
          </Pressable>

          {/* Riwayat trip driver */}
          <View style={styles.historyHead}>
            <Text style={styles.sectionTitle}>Riwayat Perjalanan ({trips.length})</Text>
            {trips.length > 0 ? (
              <Pressable onPress={handleDeleteAll} hitSlop={8} style={styles.deleteAllBtn}>
                <Trash2 size={14} color={colors.redSoft} strokeWidth={2} />
                <Text style={styles.deleteAllText}>Hapus Semua</Text>
              </Pressable>
            ) : null}
          </View>
          {trips.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Belum ada perjalanan dari driver ini.</Text>
            </View>
          ) : (
            trips.map((trip) => {
              const start = toDate(trip.startTime);
              const end = toDate(trip.endTime);
              const cls = klasifikasiSkor(trip.safetyScore ?? 0);
              const maxSpeed = trip.maxSpeed ?? 0;
              const overLimit = maxSpeed > (SPEED_LIMIT[trip.vehicleMode] ?? Infinity);
              return (
                <View key={trip.id} style={[styles.tripCard, { borderLeftColor: cls.color }]}>
                  <Pressable
                    onPress={() => router.push({ pathname: '/perjalanan/[id]', params: { id: trip.id } })}
                    style={({ pressed }) => [styles.tripMain, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <ScoreBadge score={trip.safetyScore ?? 0} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tripTitle}>
                        Perjalanan {trip.vehicleMode === 'motor' ? 'Motor' : 'Mobil'}
                      </Text>
                      <Text style={styles.tripMeta}>
                        {formatTanggal(start)} · {formatDurasi(start, end)}
                      </Text>
                      <Text style={[styles.tripMaxSpeed, overLimit && styles.tripMaxSpeedOver]}>
                        Tertinggi {maxSpeed.toFixed(0)} km/j{overLimit ? ' · lewat batas' : ''}
                      </Text>
                      {trip.incidentCount > 0 ? (
                        <Text style={styles.tripIncident}>{trip.incidentCount} insiden</Text>
                      ) : null}
                    </View>
                    <View style={styles.tripRight}>
                      <Text style={styles.tripDistance}>{(trip.distance ?? 0).toFixed(2)}</Text>
                      <Text style={styles.tripDistanceUnit}>km</Text>
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteTrip(trip.id)} hitSlop={8} style={styles.trashBtn}>
                    <Trash2 size={18} color={colors.redSoft} strokeWidth={2} />
                  </Pressable>
                </View>
              );
            })
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    backgroundColor: colors.surfaceContainerHigh,
  },
  headerTitle: { ...typography.headlineSm, fontSize: 18, color: colors.onSurface },

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
  cardHint: { ...typography.bodySm, color: colors.outline, lineHeight: 18 },

  speedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedValueWrap: { alignItems: 'center' },
  speedValue: { ...typography.displayMobile, fontSize: 44, color: colors.primaryContainer },
  speedUnit: { ...typography.labelSm, color: colors.outline },

  sensRow: { flexDirection: 'row', gap: spacing.sm },
  sensPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    alignItems: 'center',
  },
  sensPillActive: {
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderColor: colors.primaryContainer,
  },
  sensLabel: { ...typography.labelMd, color: colors.onSurfaceVariant },
  sensLabelActive: { color: colors.primaryContainer },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 54,
    borderRadius: radius.button,
    backgroundColor: colors.primaryContainer,
    marginBottom: spacing.xl,
  },
  saveLabel: { ...typography.headlineSm, fontSize: 15, color: colors.background, letterSpacing: 0.5 },

  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface },
  deleteAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deleteAllText: { ...typography.labelMd, color: colors.redSoft },
  tripMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trashBtn: { padding: spacing.xs },
  empty: { alignItems: 'center', marginTop: spacing.lg },
  emptyText: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  tripCard: {
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
  tripTitle: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface },
  tripMeta: { ...typography.bodySm, color: colors.onSurfaceVariant },
  tripMaxSpeed: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tripMaxSpeedOver: { color: colors.redSoft },
  tripIncident: { ...typography.labelSm, color: colors.redSoft },
  tripRight: { alignItems: 'flex-end' },
  tripDistance: { ...typography.dataLg, color: colors.primaryContainer },
  tripDistanceUnit: { ...typography.labelSm, color: colors.outline },
});
