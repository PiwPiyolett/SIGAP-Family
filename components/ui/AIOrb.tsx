// components/ui/AIOrb.tsx
// Orb AI volumetrik ala "Gemini Live": bola plasma dengan shading 3D (cahaya kiri-atas,
// tepi gelap), kilau spekular, dan blob warna berputar di dalam (permukaan bergolak).
// Murni SVG + reanimated (UI thread).
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
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

// Blob warna yang mengorbit di dalam bola (efek plasma bergolak).
function Orbiter({
  id,
  color,
  size,
  cx,
  cy,
  r,
  duration,
  reverse,
  opacity = 0.9,
}: {
  id: string;
  color: string;
  size: number;
  cx: number;
  cy: number;
  r: number;
  duration: number;
  reverse?: boolean;
  opacity?: number;
}) {
  const spin = useSharedValue(0);
  useEffect(() => {
    spin.value = withRepeat(
      withTiming(reverse ? -1 : 1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export function AIOrb({ size = 160 }: { size?: number }) {
  const breathe = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + breathe.value * 0.5,
    transform: [{ scale: 1 + breathe.value * 0.2 }],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * 0.05 }],
  }));
  const specStyle = useAnimatedStyle(() => ({ opacity: 0.55 + shimmer.value * 0.4 }));

  const glowSize = size * 1.7;

  return (
    <View style={[styles.wrap, { width: glowSize, height: glowSize }]}>
      {/* Glow luar */}
      <Animated.View style={[styles.abs, glowStyle]}>
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            <RadialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.primaryContainer} stopOpacity="0.45" />
              <Stop offset="1" stopColor={colors.primaryContainer} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill="url(#orb-glow)" />
        </Svg>
      </Animated.View>

      {/* Inti bola (clip lingkaran) */}
      <Animated.View style={[styles.core, { width: size, height: size }, coreStyle]}>
        {/* Base sphere — cahaya kiri-atas, tepi gelap → volume */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="orb-base" cx="36%" cy="30%" r="80%">
              <Stop offset="0" stopColor="#EAFBFF" />
              <Stop offset="0.3" stopColor="#5BD4FF" />
              <Stop offset="0.62" stopColor={gradients.aurora.blue} />
              <Stop offset="0.85" stopColor="#15246B" />
              <Stop offset="1" stopColor="#070C24" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#orb-base)" />
        </Svg>

        {/* Blob plasma berputar */}
        <Orbiter id="orb-cyan" color="#67E8FF" size={size} cx={size * 0.62} cy={size * 0.4} r={size * 0.3} duration={7000} />
        <Orbiter id="orb-purple" color={gradients.aurora.purple} size={size} cx={size * 0.38} cy={size * 0.68} r={size * 0.34} duration={9000} reverse opacity={0.8} />
        <Orbiter id="orb-blue" color="#2E6BFF" size={size} cx={size * 0.7} cy={size * 0.7} r={size * 0.28} duration={11000} opacity={0.7} />

        {/* Inner shadow / rim — pertegas tepi bola */}
        <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="orb-rim" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#000018" stopOpacity="0" />
              <Stop offset="0.72" stopColor="#000018" stopOpacity="0" />
              <Stop offset="1" stopColor="#000010" stopOpacity="0.6" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#orb-rim)" />
        </Svg>

        {/* Kilau spekular kiri-atas */}
        <Animated.View style={[StyleSheet.absoluteFill, specStyle]} pointerEvents="none">
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="orb-spec" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={size * 0.34} cy={size * 0.27} r={size * 0.16} fill="url(#orb-spec)" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  abs: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  core: { borderRadius: 9999, overflow: 'hidden' },
});
