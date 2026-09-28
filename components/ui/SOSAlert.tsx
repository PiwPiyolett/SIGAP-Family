// components/ui/SOSAlert.tsx
// Overlay full-screen "KECELAKAAN TERDETEKSI": border merah berkedip,
// countdown mundur, tombol "SAYA BAIK" (batalkan), getaran HP.
// onTimeout dipanggil bila countdown habis (SOS dikirim — STEP 10).
import { AlertTriangle, Check } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import Animated, {
  Easing,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { SOS_COUNTDOWN_SECONDS } from '@/constants/thresholds';
import { typography } from '@/constants/typography';

interface SOSAlertProps {
  visible: boolean;
  onCancel: () => void; // user menekan "SAYA BAIK"
  onTimeout: () => void; // countdown habis → kirim SOS
}

export function SOSAlert({ visible, onCancel, onTimeout }: SOSAlertProps) {
  const [count, setCount] = useState(SOS_COUNTDOWN_SECONDS);
  const blink = useSharedValue(0);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!visible) return;

    setCount(SOS_COUNTDOWN_SECONDS);

    // Getaran berulang (pola: jeda, getar) sampai overlay ditutup.
    Vibration.vibrate([0, 600, 400], true);

    // Border berkedip.
    blink.value = withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true);

    // Countdown mundur tiap detik.
    const id = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(id);
          onTimeoutRef.current();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearInterval(id);
      cancelAnimation(blink);
      Vibration.cancel();
    };
  }, [visible]);

  const borderStyle = useAnimatedStyle(() => ({ opacity: 0.3 + blink.value * 0.7 }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        {/* Border berkedip */}
        <Animated.View style={[styles.blinkBorder, borderStyle]} pointerEvents="none" />

        <Animated.View entering={ZoomIn.duration(350)} style={styles.card}>
          <AlertTriangle size={56} color={colors.redSoft} strokeWidth={2} />
          <Text style={styles.title}>KECELAKAAN TERDETEKSI</Text>
          <Text style={styles.subtitle}>Apakah kamu baik-baik saja?</Text>

          <Text style={styles.countdown}>{count}</Text>
          <Text style={styles.countdownLabel}>
            SOS akan dikirim dalam {count} detik...
          </Text>

          <Pressable
            onPress={onCancel}
            style={({ pressed }) => [styles.okBtn, pressed && styles.okBtnPressed]}
          >
            <Check size={22} color={colors.background} strokeWidth={3} />
            <Text style={styles.okBtnText}>SAYA BAIK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(147,0,10,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  blinkBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 5,
    borderColor: '#EF4444',
  },
  card: {
    width: '100%',
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: colors.errorContainer,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { ...typography.headlineSm, color: colors.redSoft, textAlign: 'center', marginTop: spacing.sm },
  subtitle: { ...typography.bodyLg, color: colors.onSurface, textAlign: 'center' },
  countdown: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 80,
    color: colors.redSoft,
    marginTop: spacing.sm,
  },
  countdownLabel: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  okBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.tertiaryContainer,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  okBtnPressed: { opacity: 0.85 },
  okBtnText: { ...typography.headlineSm, fontSize: 18, color: colors.background },
});

