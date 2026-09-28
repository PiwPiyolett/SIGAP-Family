// components/ui/Screen.tsx
// Wrapper layar standar: background Dark Guardian + safe area + (opsional) keyboard avoidance.
//
// CATATAN: KeyboardAvoidingView TIDAK dipakai — di New Architecture (SDK 54) ia
// me-remount anak-anaknya saat keyboard muncul, membuat TextInput kehilangan fokus
// (keyboard menutup sendiri). Sebagai gantinya, ScrollView memakai
// `automaticallyAdjustKeyboardInsets` (iOS) yang ditangani native tanpa remount.
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  avoidKeyboard?: boolean;
  aurora?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  avoidKeyboard = false,
  aurora = false,
  edges = ['top', 'bottom'],
  style,
  contentContainerStyle,
}: ScreenProps) {
  const padStyle = padded ? { paddingHorizontal: spacing.marginMobile } : null;

  return (
    <SafeAreaView
      style={[styles.safe, aurora && styles.transparent, style]}
      edges={edges}
    >
      <StatusBar style="light" />
      {aurora ? <AuroraBackground /> : null}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, padStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={avoidKeyboard}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padStyle, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  transparent: { backgroundColor: 'transparent' },
  flex: { flex: 1 },
  scrollContent: { paddingVertical: spacing.lg, flexGrow: 1 },
});
