# Panduan Build iOS (iPhone) — SIGAP Guardian Driver

Dokumen ini dibuat agar saat **akun Apple Developer sudah siap**, build iOS tinggal dijalankan
tanpa setup ulang. **Tidak butuh Mac** — semua build berjalan di cloud EAS.

> Konfigurasi iOS sudah disiapkan di `app.json` (bundleId, background location, izin sensor gerak).
> Tidak ada yang perlu diubah lagi di kode.

---

## Prasyarat (yang harus kamu siapkan nanti)

1. **Akun Apple Developer Program berbayar** — $99/tahun, daftar di https://developer.apple.com/programs/
   (proses verifikasi Apple bisa 24–48 jam).
2. Sudah login Expo di komputer ini (sudah: akun `ariqoba`). Cek: `eas whoami`.
3. `eas-cli` sudah terpasang (sudah). Cek: `eas --version`.

---

## CARA A — Install langsung ke iPhone sendiri (Ad-hoc / Internal) ✅ direkomendasikan

Cocok untuk uji di HP sendiri / beberapa device tim. Berlaku ~1 tahun, sampai 100 device.

### 1. Daftarkan UDID iPhone (sekali per device)
```powershell
eas device:create
```
- Pilih "Website" atau "Developer Portal" → muncul **link/QR**.
- Buka link itu **di iPhone yang dituju** → install profil → UDID otomatis terdaftar.

### 2. Build IPA
```powershell
eas build -p ios --profile preview
```
- Saat diminta, **login dengan Apple ID** akun Developer-mu.
- Biarkan EAS **mengelola kredensial otomatis** (pilih "Yes" untuk generate
  Distribution Certificate + Ad Hoc Provisioning Profile). Tidak perlu Mac.
- Tunggu ~15–25 menit (antre cloud).

### 3. Install ke iPhone
- Selesai build → EAS memberi **URL + QR**.
- Buka URL itu di **Safari pada iPhone** → tombol Install → app masuk ke home screen.
- Jika diminta percaya: **Settings → General → VPN & Device Management** → trust.

### 4. Saat menjalankan
- Beri izin lokasi **"Allow Always / Izinkan Selalu"** agar deteksi kecelakaan di background jalan.

> Menambah iPhone baru? Ulangi langkah 1 (daftar UDID) lalu build ulang (langkah 2).

---

## CARA B — TestFlight (kalau perlu dibagikan ke banyak orang / juri)

Tanpa daftar UDID. Penguji install lewat aplikasi **TestFlight**. Tiap build berlaku 90 hari.

### 1. Build versi produksi
```powershell
eas build -p ios --profile production
```

### 2. Kirim ke App Store Connect / TestFlight
```powershell
eas submit -p ios
```
- Ikuti prompt (pilih build terakhir). EAS upload ke App Store Connect.
- Di https://appstoreconnect.apple.com → TestFlight → tambahkan email penguji.
- Penguji dapat undangan → install via app TestFlight (gratis di App Store).

---

## Catatan penting

- **Ini build release** → tombol "Simulasi Kecelakaan" (`__DEV__`) **tidak muncul**.
  Uji deteksi harus dengan gerakan nyata.
- `versionCode`/`buildNumber` saat ini `1`. Untuk submit build baru ke TestFlight,
  naikkan `ios.buildNumber` di `app.json` (mis. "2") tiap upload.
- Kredensial Apple dikelola otomatis oleh EAS dan tersimpan di akun Expo —
  build berikutnya tidak perlu setup lagi.
- Env Firebase & Gemini sudah disuntik via `eas.json` (profil `preview`/`production`),
  sama seperti build Android. Tidak perlu tambahan.

---

## Ringkasan satu baris (setelah akun siap)
```powershell
# iPhone sendiri:
eas device:create   # sekali per device
eas build -p ios --profile preview

# Banyak penguji:
eas build -p ios --profile production
eas submit -p ios
```
