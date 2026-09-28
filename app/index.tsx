// app/index.tsx — Splash sinematik SIPERKASA Family.
// Aurora + partikel cahaya naik + light-sweep di logo + halo berdenyut kuat
// + cincin orbit + ikon mengambang/bernafas → fade-out mulus ke login/tabs.
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_KEY } from './onboarding';

const SHIELD_SIZE = 88;
const RING_BASE = 180;
const TOTAL_DURATION = 3400;
const FADE_OUT_MS = 500;
const AUTH_MAX_WAIT_MS = 8000;
const SPARK_COUNT = 16;

// Pseudo-random deterministik per partikel.
const rnd = (i: number, n: number) => (Math.sin(i * 97.13 + n * 31.7) + 1) / 2;

// Partikel cahaya yang naik perlahan & memudar, berulang.
function Spark({ index }: { index: number }) {
  const startX = (rnd(index, 1) - 0.5) * 230;
  const size = 2 + rnd(index, 2) * 3.5;
  const duration = 3200 + rnd(index, 3) * 3200;
  const delay = rnd(index, 4) * 3500;
  const rise = 150 + rnd(index, 5) * 150;
  const drift = (rnd(index, 6) - 0.5) * 30;

  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
    return () => cancelAnimation(p);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.15, 0.75, 1], [0, 0.9, 0.6, 0]),
    transform: [
      { translateX: startX + Math.sin(p.value * Math.PI * 2) * drift },
      { translateY: interpolate(p.value, [0, 1], [110, 110 - rise]) },
      { scale: interpolate(p.value, [0, 0.2, 1], [0.4, 1, 0.5]) },
    ],
  }));

  return (
    <Animated.View
      style={[styles.spark, { width: size, height: size, borderRadius: size }, style]}
      pointerEvents="none"
    />
  );
}

// Cincin radar memancar keluar.
function RadarRing({ delay }: { delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.ease) }), -1, false),
    );
    return () => cancelAnimation(p);
  }, [delay, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 1], [0.5, 2.4]) }],
    opacity: interpolate(p.value, [0, 0.15, 1], [0, 0.4, 0]),
  }));
  return <Animated.View style={[styles.radarRing, style]} pointerEvents="none" />;
}

export default function Splash() {
  const { user, initializing } = useAuth();
  const authRef = useRef({ user });
  authRef.current = { user };

  // Splash baru berpindah halaman saat animasi selesai DAN status auth sudah pasti.
  // Restore sesi Firebase dari AsyncStorage kadang lebih lama dari durasi splash di
  // HP lambat; tanpa menunggu `initializing`, user yang sudah login ikut dilempar ke /login.
  const [animationDone, setAnimationDone] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  const enter = useSharedValue(0);
  const breathe = useSharedValue(0);
  const orbit = useSharedValue(0);
  const sweep = useSharedValue(0);
  const titleIn = useSharedValue(0);
  const taglineIn = useSharedValue(0);
  const screen = useSharedValue(1);

  useEffect(() => {
    enter.value = withDelay(150, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));

    breathe.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    orbit.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);

    // Light-sweep: glint cepat lalu jeda, berulang.
    sweep.value = withDelay(
      900,
      withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false),
    );

    titleIn.value = withDelay(1000, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
    taglineIn.value = withDelay(1400, withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) }));

    const t = setTimeout(() => setAnimationDone(true), TOTAL_DURATION - FADE_OUT_MS);
    // Jaring pengaman: jangan tertahan di splash bila status auth tak kunjung pasti.
    const guard = setTimeout(() => setAuthTimedOut(true), AUTH_MAX_WAIT_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(guard);
    };
  }, []);

  // Fade-out lalu pindah halaman.
  useEffect(() => {
    if (!animationDone) return;
    if (initializing && !authTimedOut) return; // tahan splash selama auth belum pasti

    screen.value = withTiming(0, { duration: FADE_OUT_MS });

    let cancelled = false;
    const t = setTimeout(async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (cancelled) return;
      if (!seen) {
        router.replace('/onboarding');
      } else {
        router.replace(authRef.current.user ? '/(tabs)' : '/login');
      }
    }, FADE_OUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [animationDone, initializing, authTimedOut]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screen.value }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breathe.value, [0, 1], [0.18, 0.42]) * enter.value,
    transform: [{ scale: interpolate(breathe.value, [0, 1], [0.85, 1.15]) }],
  }));

  const shieldStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { scale: interpolate(enter.value, [0, 1], [0.3, 1]) * (1 + breathe.value * 0.05) },
      { translateY: (breathe.value - 0.5) * 12 },
    ],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    opacity: enter.value * 0.9,
    transform: [{ rotate: `${orbit.value * 360}deg` }],
  }));

  // Glint melintas (terlihat hanya di 0–35% siklus), sisanya jeda.
  const sweepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sweep.value, [0, 0.05, 0.3, 0.35], [0, 0.8, 0.8, 0]) * enter.value,
    transform: [
      { rotate: '22deg' },
      { translateX: interpolate(sweep.value, [0, 0.35, 1], [-RING_BASE, RING_BASE, RING_BASE]) },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleIn.value,
    transform: [{ translateY: interpolate(titleIn.value, [0, 1], [16, 0]) }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineIn.value,
    letterSpacing: interpolate(taglineIn.value, [0, 1], [1, 1.5]),
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <AuroraBackground />

      {/* Partikel cahaya + radar */}
      <View style={styles.center} pointerEvents="none">
        {Array.from({ length: SPARK_COUNT }).map((_, i) => (
          <Spark key={i} index={i} />
        ))}
        <RadarRing delay={0} />
        <RadarRing delay={1300} />
      </View>

      <View style={styles.logoBlock}>
        <View style={styles.shieldWrap}>
          {/* Halo berdenyut kuat */}
          <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none" />

          {/* Cincin orbit berputar */}
          <Animated.View style={[styles.abs, orbitStyle]} pointerEvents="none">
            <Svg width={RING_BASE} height={RING_BASE}>
              <Circle
                cx={RING_BASE / 2}
                cy={RING_BASE / 2}
                r={RING_BASE / 2 - 4}
                stroke={colors.primaryContainer}
                strokeWidth={2}
                fill="none"
                strokeDasharray={`${RING_BASE * 0.9} ${RING_BASE * 2}`}
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>

          {/* Light-sweep (glint) — diklip lingkaran */}
          <View style={styles.sweepClip} pointerEvents="none">
            <Animated.View style={[styles.sweepStrip, sweepStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(168,232,255,0.55)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          {/* Ikon */}
          <Animated.View style={shieldStyle}>
            <Users size={SHIELD_SIZE} color={colors.primaryContainer} strokeWidth={1.5} />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.brand, titleStyle]}>SIPERKASA</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>PEMANTAU PERILAKU BERKENDARA SISWA</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  spark: {
    position: 'absolute',
    backgroundColor: colors.primary,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  logoBlock: { alignItems: 'center', gap: spacing.sm },
  shieldWrap: {
    width: RING_BASE,
    height: RING_BASE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  abs: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: RING_BASE * 0.8,
    height: RING_BASE * 0.8,
    borderRadius: RING_BASE,
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOpacity: 1,
    shadowRadius: 48,
    shadowOffset: { width: 0, height: 0 },
  },
  sweepClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RING_BASE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweepStrip: { width: RING_BASE * 0.5, height: RING_BASE * 1.8 },
  radarRing: {
    position: 'absolute',
    width: RING_BASE,
    height: RING_BASE,
    borderRadius: RING_BASE / 2,
    borderWidth: 1,
    borderColor: colors.surfaceTint,
  },
  brand: { ...typography.displayMd, color: colors.onSurface },
  tagline: { ...typography.labelSm, color: colors.primaryContainer, textAlign: 'center' },
});
