// components/ui/SelectableTile.tsx
// Tile pilihan (mode kendaraan / penempatan): ikon atas, label bawah.
// State aktif: border cyan + ikon cyan + badge centang. Dipakai di Home Dashboard.
import { Check, LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface SelectableTileProps {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onPress: () => void;
}

export function SelectableTile({ label, icon: Icon, selected, onPress }: SelectableTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: selected ? colors.primaryContainer : colors.surfaceContainerHighest },
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <View style={styles.badge}>
          <Check size={12} color={colors.background} strokeWidth={3} />
        </View>
      ) : null}
      <Icon
        size={32}
        color={selected ? colors.primaryContainer : colors.outline}
        strokeWidth={1.8}
      />
      <Text style={[styles.label, { color: selected ? colors.onSurface : colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    minHeight: 100,
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.labelMd, marginTop: spacing.xs },
});
