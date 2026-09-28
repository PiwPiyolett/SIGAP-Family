// app/panduan.tsx — Panduan penggunaan SIPERKASA Family.
import { router } from 'expo-router';
import { ArrowLeft, Gauge, History, Trash2, UserPlus, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface Section {
  Icon: LucideIcon;
  title: string;
  steps: string[];
}

const SECTIONS: Section[] = [
  {
    Icon: UserPlus,
    title: 'Menautkan Driver',
    steps: [
      'Di Beranda, ketik username driver (akun SIPERKASA-nya) lalu "Tambahkan".',
      'Atau bagikan Kode Undangan keluarga — driver memasukkannya di app SIPERKASA mereka (menu Keluarga).',
      'Driver yang tertaut akan muncul di daftar.',
    ],
  },
  {
    Icon: Gauge,
    title: 'Atur Keamanan',
    steps: [
      'Ketuk salah satu driver.',
      'Atur Batas Kecepatan (tombol − / +) dan Sensitivitas deteksi (Rendah/Sedang/Tinggi).',
      'Tekan "Simpan". Driver otomatis menerapkannya saat berkendara.',
    ],
  },
  {
    Icon: History,
    title: 'Pantau Perjalanan',
    steps: [
      'Ketuk driver untuk melihat riwayat perjalanannya & skor keselamatan.',
      'Ketuk satu perjalanan untuk lihat rute, waktu, dan lokasi insiden + link Google Maps.',
    ],
  },
  {
    Icon: Trash2,
    title: 'Hapus Riwayat',
    steps: [
      'Di detail driver, ketuk ikon hapus pada satu perjalanan, atau "Hapus Semua" untuk membersihkan seluruh riwayatnya.',
    ],
  },
];

export default function Panduan() {
  return (
    <Screen scroll aurora>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.onSurface} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Panduan Penggunaan</Text>
      </View>

      <Text style={styles.intro}>
        Panduan singkat memakai SIPERKASA Family untuk memantau keselamatan keluargamu.
      </Text>

      {SECTIONS.map((s, idx) => {
        const Icon = s.Icon;
        return (
          <View key={idx} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.iconWrap}>
                <Icon size={18} color={colors.primaryContainer} strokeWidth={2} />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
            </View>
            {s.steps.map((step, n) => (
              <View key={n} style={styles.stepRow}>
                <Text style={styles.stepNum}>{n + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    backgroundColor: colors.surfaceContainerHigh,
  },
  headerTitle: { ...typography.headlineSm, fontSize: 18, color: colors.onSurface },
  intro: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.lg, lineHeight: 20 },
  card: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...typography.headlineSm, fontSize: 16, color: colors.onSurface, flex: 1 },
  stepRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  stepNum: {
    ...typography.labelSm,
    color: colors.primaryContainer,
    backgroundColor: colors.surfaceContainer,
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    overflow: 'hidden',
  },
  stepText: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1, lineHeight: 20 },
});
