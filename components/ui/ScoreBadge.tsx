// components/ui/ScoreBadge.tsx
// Lingkaran skor dengan ring gradient sesuai klasifikasi (aman/hati-hati/berbahaya).
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { klasifikasiSkor } from '@/services/scoreCalculator';

interface ScoreBadgeProps {
  score: number;
  size?: number;
}

export function ScoreBadge({ score, size = 56 }: ScoreBadgeProps) {
  const cls = klasifikasiSkor(score);
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const id = `grad-${cls.status}`;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={cls.gradient[0]} />
            <Stop offset="1" stopColor={cls.gradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle cx={c} cy={c} r={r} stroke={colors.surfaceContainerHighest} strokeWidth={stroke} fill="none" />
        <Circle cx={c} cy={c} r={r} stroke={`url(#${id})`} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.score, { fontSize: size * 0.32 }]}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  score: { fontFamily: 'JetBrainsMono_700Bold', color: colors.onSurface },
});
