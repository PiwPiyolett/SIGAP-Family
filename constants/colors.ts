// constants/colors.ts
// Design system "Dark Guardian" — palet warna resmi (DESIGN.md)
export const colors = {
  // === BACKGROUNDS ===
  background: '#0C1322', // Layar utama — deep navy black
  surfaceContainerLowest: '#070E1D', // Level paling dalam
  surfaceContainerLow: '#141B2B', // Surface sekunder
  surfaceContainer: '#191F2F', // Container umum
  surfaceContainerHigh: '#232A3A', // Card background
  surfaceContainerHighest: '#2E3545', // Border kartu / elemen terangkat
  surfaceBright: '#323949', // Elemen terang pada dark theme

  // === TEKS ===
  onSurface: '#DCE2F7', // Teks utama — off-white
  onSurfaceVariant: '#BBC9CF', // Teks sekunder — slate muted

  // === PRIMARY ACCENT (Cyan) ===
  primary: '#A8E8FF', // Teks primer ringan
  primaryContainer: '#00D4FF', // Cyan aktif — tombol, progress, active state
  onPrimaryContainer: '#00586B', // Teks di atas cyan
  surfaceTint: '#3CD7FF', // Glow/tint effect

  // === SECONDARY ACCENT (Blue) ===
  secondary: '#ADC6FF', // Teks secondary
  secondaryContainer: '#0566D9', // Royal blue — aksi sekunder
  onSecondaryContainer: '#E6ECFF',

  // === TERTIARY (Green — Success) ===
  tertiary: '#6AF7BA', // Green terang
  tertiaryContainer: '#49DA9F', // Green aktif
  onTertiaryContainer: '#005C3E',

  // === SEMANTIC ===
  error: '#FFB4AB', // Red ringan
  errorContainer: '#93000A', // Red kuat — SOS, danger
  onErrorContainer: '#FFDAD6',
  warning: '#F59E0B', // Amber — warning state

  // === OUTLINE ===
  outline: '#859398', // Border normal
  outlineVariant: '#3C494E', // Border subtle

  // === SHORTHAND (untuk kemudahan coding) ===
  cyan: '#00D4FF', // Aksen utama
  blue: '#0566D9', // Aksen sekunder
  green: '#49DA9F', // Sukses
  red: '#93000A', // Bahaya/SOS
  redSoft: '#FFB4AB', // Error ringan
  amber: '#F59E0B', // Warning
} as const;

export type ColorKey = keyof typeof colors;
