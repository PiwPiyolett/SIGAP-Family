// constants/gradients.ts — palet gradasi ala Gemini (ungu → biru → biru tua → merah).
export const gradients = {
  // Warna blob aurora (background beranimasi).
  aurora: {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    indigo: '#1E3A8A',
    red: '#EF4444',
  },
  // Gradient aksen branding (tombol/teks penting).
  brand: ['#8B5CF6', '#3B82F6', '#00D4FF'] as const,
  // Gradient guardian (cyan) — tetap dipakai untuk tombol utama.
  guardian: ['#3CD7FF', '#00D4FF'] as const,
} as const;
