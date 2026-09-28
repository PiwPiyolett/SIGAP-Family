// components/ui/Card.tsx
// Card gelap design system. Opsi: selected (border cyan + glow), accent (border kiri semantik).
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { glows } from '@/constants/shadows';
import { radius, spacing } from '@/constants/spacing';

interface CardProps {
  children: ReactNode;
  selected?: boolean;
  accentColor?: string; // border kiri 4px untuk alert kritis
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, selected, accentColor, onPress, style }: CardProps) {
  const cardStyle: StyleProp<ViewStyle> = [
    styles.card,
    glows.card,
    selected && styles.selected,
    selected && glows.cyan,
    accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primaryContainer,
  },
  pressed: { opacity: 0.9 },
});
