// components/ui/SpeedGauge.tsx
// Gauge kecepatan melingkar (busur 270°) berbasis SVG + animasi reanimated.
// Warna busur: cyan (normal) → amber (mendekati batas) → merah (melebihi batas).
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SpeedGaugeProps {
  speed: number; // km/h
  limit: number; // batas kecepatan km/h
  size?: number;
}

const SWEEP = 0.75; // 270° dari 360°

export function SpeedGauge({ speed, limit, size = 260 }: SpeedGaugeProps) {
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * SWEEP;

  const ratio = limit > 0 ? speed / limit : 0;
  const fill = Math.max(0, Math.min(ratio, 1)); // 0..1 untuk panjang busur

  // Warna sesuai ratio kecepatan.
  const color = ratio >= 1 ? colors.redSoft : ratio >= 0.8 ? colors.amber : colors.primaryContainer;

  // Animasi pengisian busur.
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(fill, { duration: 400 });
  }, [fill]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: arcLength * (1 - progress.value),
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation={135} origin={`${c}, ${c}`}>
          {/* Track (background) */}
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={colors.surfaceContainerHigh}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={c}
            cy={c}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Angka di tengah */}
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.speed, { color }]}>{Math.round(speed)}</Text>
        <Text style={styles.unit}>KM/H</Text>
        <Text style={styles.limit}>batas {limit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  speed: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 72, lineHeight: 76 },
  unit: { ...typography.labelSm, color: colors.onSurfaceVariant, letterSpacing: 2 },
  limit: { ...typography.labelSm, color: colors.outline, marginTop: 2 },
});
