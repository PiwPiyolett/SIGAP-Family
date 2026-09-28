// app/onboarding.tsx — Slide sambutan SIPERKASA Family (sekali tampil).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Gauge, UserPlus, Users, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';

export const ONBOARDING_KEY = 'onboarding_done_v1';

interface Slide {
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const SLIDES: Slide[] = [
  {
    Icon: Users,
    title: 'Selamat Datang di SIPERKASA Keluarga',
    desc: 'Pantau keselamatan berkendara seluruh anggota keluargamu dari satu tempat.',
  },
  {
    Icon: UserPlus,
    title: 'Tautkan Driver',
    desc: 'Tambahkan anggota keluarga lewat username mereka, atau bagikan kode undangan untuk mereka gabung sendiri.',
  },
  {
    Icon: Gauge,
    title: 'Atur & Pantau',
    desc: 'Atur batas kecepatan & sensitivitas deteksi tiap driver, lalu pantau riwayat perjalanan dan lokasi insiden.',
  },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    router.replace(user ? '/(tabs)' : '/login');
  };

  const slide = SLIDES[i];
  const Icon = slide.Icon;

  return (
    <Screen aurora>
      <View style={styles.root}>
        <View style={styles.top}>
          <Pressable onPress={finish} hitSlop={8}>
            <Text style={styles.skip}>Lewati</Text>
          </Pressable>
        </View>

        <Animated.View key={i} entering={FadeIn.duration(350)} style={styles.center}>
          <View style={styles.iconRing}>
            <Icon size={72} color={colors.primaryContainer} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.desc}</Text>
        </Animated.View>

        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === i && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.nav}>
          {i > 0 ? (
            <Pressable onPress={() => setI(i - 1)} style={styles.back} hitSlop={8}>
              <Text style={styles.backText}>Kembali</Text>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
          <Button
            label={last ? 'Mulai' : 'Lanjut'}
            onPress={() => (last ? finish() : setI(i + 1))}
            style={styles.next}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { alignItems: 'flex-end', paddingVertical: spacing.sm },
  skip: { ...typography.labelMd, color: colors.onSurfaceVariant },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    marginBottom: spacing.lg,
  },
  title: { ...typography.headlineMd, color: colors.onSurface, textAlign: 'center' },
  desc: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainerHighest },
  dotActive: { backgroundColor: colors.primaryContainer, width: 22 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingBottom: spacing.md },
  back: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' },
  backText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  next: { flex: 1 },
});
