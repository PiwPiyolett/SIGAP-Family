// constants/typography.ts
// Tiga keluarga font:
// 1. Space Grotesk — headings, branding (geometris, futuristik)
// 2. Inter         — body, label, UI text (legibel)
// 3. JetBrains Mono — semua angka/data (monospace, aligned)
//
// Nama fontFamily harus cocok dengan key yang di-load di app/_layout.tsx
// (dari paket @expo-google-fonts/*).
import { TextStyle } from 'react-native';

export const fontFamily = {
  spaceGroteskBold: 'SpaceGrotesk_700Bold',
  spaceGroteskSemiBold: 'SpaceGrotesk_600SemiBold',
  spaceGroteskMedium: 'SpaceGrotesk_500Medium',
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const typography = {
  // Space Grotesk — Headings
  displayLg: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 48, lineHeight: 56, letterSpacing: -0.96 },
  displayMd: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 36, lineHeight: 44, letterSpacing: -0.36 },
  displayMobile: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 32, lineHeight: 40 },
  headlineLg: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 28, lineHeight: 36 },
  headlineMd: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 24, lineHeight: 32 },
  headlineSm: { fontFamily: fontFamily.spaceGroteskBold, fontSize: 20, lineHeight: 28 },

  // Inter — Body & Labels
  bodyLg: { fontFamily: fontFamily.interRegular, fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: fontFamily.interRegular, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: fontFamily.interRegular, fontSize: 14, lineHeight: 20 },
  labelMd: { fontFamily: fontFamily.interMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  labelSm: { fontFamily: fontFamily.interSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },

  // JetBrains Mono — Data & Angka
  dataLg: { fontFamily: fontFamily.monoMedium, fontSize: 20, lineHeight: 28 },
  dataMd: { fontFamily: fontFamily.monoMedium, fontSize: 16, lineHeight: 24 },
} as const satisfies Record<string, TextStyle>;

export type TypographyKey = keyof typeof typography;
