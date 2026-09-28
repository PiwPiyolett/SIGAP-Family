# 🛡️ SIGAP: Guardian Driver

Aplikasi deteksi kecelakaan otomatis + SOS WhatsApp untuk pengemudi di Indonesia.
React Native + Expo (Expo Router) · TypeScript · Design system **Dark Guardian**.

---

## ⚠️ Prasyarat (WAJIB sebelum menjalankan)

Node.js **belum terpasang** di komputer ini. Pasang dulu:

1. Download **Node.js LTS** dari https://nodejs.org → jalankan installer `.msi` (biarkan opsi default).
2. **Tutup & buka ulang** terminal / VS Code agar PATH ter-update.
3. Verifikasi:
   ```powershell
   node --version   # mis. v20.x.x
   npm --version    # mis. 10.x.x
   ```

---

## 🚀 Menjalankan proyek

```powershell
# 1. Dari folder proyek ini
npm install

# 2. (Penting) selaraskan versi paket dengan versi Expo SDK yang terpasang
npx expo install --fix

# 3. Jalankan
npx expo start
```

Lalu:
- Scan QR code dengan app **Expo Go** di HP (rekomendasi — sensor butuh perangkat nyata), atau
- Tekan `a` untuk Android Emulator.

> Buat file `.env` dari `.env.example` dan isi kunci Firebase + Gemini sebelum fitur auth/AI dipakai (STEP 3 & 13).

---

## 📁 Struktur

```
app/                      # Expo Router (file-based routing)
  _layout.tsx             # Root: load font + splash + stack
  index.tsx               # Entry / splash sederhana
  (auth)/                 # login, register (tanpa bottom nav)
  (tabs)/                 # index (Home), riwayat, edukasi (+ bottom nav)
  perjalanan/aktif.tsx    # Active Trip Screen
  pengaturan/kontak-darurat.tsx
components/ui/            # Button, Card, Screen (+ menyusul)
constants/                # colors, typography, spacing, shadows, thresholds
types/                    # TypeScript interfaces
assets/images/            # icon/splash placeholder (ganti dengan logo asli)
```

---

## 🗺️ Roadmap pembangunan

| Step | Fitur | Status |
|------|-------|--------|
| 1 | Setup project + navigasi + design system | ✅ Selesai |
| 2 | Splash screen + animasi opening | ⬜ |
| 3 | Login & Register + Firebase Auth | ⬜ |
| 4 | Home Dashboard UI | ⬜ |
| 5 | Accelerometer + Gyroscope (HP fisik) | ⬜ |
| 6 | GPS tracking + jarak | ⬜ |
| 7 | Active Trip + SpeedGauge + StatCards | ⬜ |
| 8 | Deteksi kecelakaan + SOS Alert overlay | ⬜ |
| 9 | Kontak Darurat + Firestore | ⬜ |
| 10 | SOS WhatsApp (deep link) | ⬜ |
| 11 | Simpan perjalanan ke Firestore | ⬜ |
| 12 | Riwayat Perjalanan | ⬜ |
| 13 | Chat AI Gemini | ⬜ |
| 14–15 | Testing + polish | ⬜ |

Detail lengkap ada di `SIGAP_Master_Brief_v3.md`.
