// components/ui/AuroraBackground.tsx
// Latar beranimasi ala Gemini: blob gradasi (ungu/biru/biru tua/merah) yang
// bergerak & berdenyut halus. Radial gradient (SVG) + transform reanimated (UI thread).
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/colors';
import { gradients } from '@/constants/gradients';

const { width, height } = Dimensions.get('window');

interface BlobProps {
  id: string;
  color: string;
  size: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  duration: number;
  maxOpacity?: number;
}

function Blob({ id, color, size, from, to, duration, maxOpacity = 0.55 }: BlobProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: from.x + (to.x - from.x) * t.value },
      { translateY: from.y + (to.y - from.y) * t.value },
      { scale: 1 + t.value * 0.25 },
    ],
    opacity: 0.6 + t.value * 0.4,
  }));

  return (
    <Animated.View style={[styles.blob, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={maxOpacity} />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export function AuroraBackground() {
  const big = width * 1.1;
  return (
    <View style={styles.container} pointerEvents="none">
      <Blob
        id="aurora-purple"
        color={gradients.aurora.purple}
        size={big}
        from={{ x: -width * 0.3, y: -height * 0.1 }}
        to={{ x: -width * 0.1, y: height * 0.05 }}
        duration={9000}
      />
      <Blob
        id="aurora-blue"
        color={gradients.aurora.blue}
        size={big}
        from={{ x: width * 0.35, y: -height * 0.05 }}
        to={{ x: width * 0.15, y: height * 0.15 }}
        duration={11000}
      />
      <Blob
        id="aurora-indigo"
        color={gradients.aurora.indigo}
        size={big * 1.1}
        from={{ x: -width * 0.1, y: height * 0.55 }}
        to={{ x: width * 0.1, y: height * 0.4 }}
        duration={13000}
      />
      <Blob
        id="aurora-red"
        color={gradients.aurora.red}
        size={width * 0.8}
        from={{ x: width * 0.4, y: height * 0.6 }}
        to={{ x: width * 0.5, y: height * 0.75 }}
        duration={15000}
        maxOpacity={0.3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  blob: { position: 'absolute' },
});
