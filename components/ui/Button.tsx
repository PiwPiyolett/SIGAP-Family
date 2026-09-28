// components/ui/Button.tsx
// Tombol design system: primary (gradient cyan), secondary (blue), danger (SOS), outline.
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@/constants/colors';
import { glows } from '@/constants/shadows';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

type Variant = 'primary' | 'secondary' | 'danger' | 'outline';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: textColor[variant] }]}>{label.toUpperCase()}</Text>
        </>
      )}
    </View>
  );

  // Primary: gradient cyan
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          glows.cyan,
          isDisabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.surfaceTint, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle[variant],
        variant === 'secondary' && glows.blue,
        variant === 'danger' && glows.danger,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const textColor: Record<Variant, string> = {
  primary: colors.background,
  secondary: colors.onSecondaryContainer,
  danger: colors.redSoft,
  outline: colors.primaryContainer,
};

const variantStyle: Record<Variant, ViewStyle> = {
  primary: {},
  secondary: { backgroundColor: colors.secondaryContainer },
  danger: {
    backgroundColor: 'rgba(147,0,10,0.8)',
    borderWidth: 1,
    borderColor: colors.redSoft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.surfaceTint,
  },
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: radius.button,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  label: { ...typography.headlineSm, fontSize: 16, letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
