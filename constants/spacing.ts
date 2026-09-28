// constants/spacing.ts
export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  gutter: 24, // Jarak antar kolom
  marginMobile: 16, // Margin kiri-kanan layar
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
  card: 16, // Semua card
  button: 14, // Semua tombol
  chip: 8, // Tag/badge kecil
  input: 14, // Input field
} as const;
