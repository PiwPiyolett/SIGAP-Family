// components/ui/Input.tsx
// Input field design system: bg gelap, border fokus cyan + glow, ikon kiri, toggle password.
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/spacing';
import { typography } from '@/constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  password?: boolean;
  error?: string;
}

export function Input({ label, icon: Icon, password, error, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(password ?? false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
      <View
        style={[
          styles.field,
          { borderColor: error ? colors.redSoft : focused ? colors.primaryContainer : colors.outlineVariant },
        ]}
      >
        {Icon ? <Icon size={20} color={colors.primaryContainer} strokeWidth={1.8} /> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.outline}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...rest}
        />
        {password ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            {hidden ? (
              <EyeOff size={20} color={colors.onSurfaceVariant} strokeWidth={1.8} />
            ) : (
              <Eye size={20} color={colors.onSurfaceVariant} strokeWidth={1.8} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.labelSm, color: colors.onSurfaceVariant },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    // borderWidth KONSTAN 2px — di Fabric, mengubah borderWidth/shadow/elevation
    // saat fokus memicu native view dibuat ulang → TextInput blur. Saat fokus
    // cukup ubah borderColor saja (tidak memicu recreation).
    borderWidth: 2,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 54,
  },
  input: { flex: 1, ...typography.bodyMd, color: colors.onSurface, paddingVertical: 0 },
  errorText: { ...typography.bodySm, color: colors.redSoft },
});
