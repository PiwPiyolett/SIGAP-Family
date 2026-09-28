// constants/shadows.ts
import { ViewStyle } from 'react-native';

export const glows = {
  // Glow cyan untuk elemen aktif/interaktif utama
  cyan: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  // Glow biru untuk tombol sekunder
  blue: {
    shadowColor: '#0566D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  // Shadow standar kartu
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  // Glow merah untuk SOS/alert
  danger: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
} as const satisfies Record<string, ViewStyle>;
