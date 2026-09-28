// services/whatsapp.ts — kirim pesan SOS via WhatsApp deep link.
// Membuka WhatsApp satu per satu untuk tiap kontak darurat (user menekan Send).
// Pengiriman otomatis penuh butuh WhatsApp Business API (berbayar).
import { Linking } from 'react-native';
import type { EmergencyContact, GeoPoint } from '@/types';

export interface SOSResult {
  attempted: number;
  opened: number;
  whatsappAvailable: boolean;
}

// Susun teks pesan SOS (di-encode untuk URL).
export function buildSOSMessage(userName: string, location: GeoPoint | null): string {
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const lokasiBlok = location
    ? `📍 *Lokasi:*\nhttps://maps.google.com/?q=${location.lat},${location.lng}\n\n`
    : `📍 *Lokasi:* tidak tersedia\n\n`;

  return (
    `🚨 *SIPERKASA ALERT*\n\n` +
    `*${userName}* mungkin mengalami kecelakaan!\n\n` +
    lokasiBlok +
    `🕐 *Waktu:* ${waktu}\n\n` +
    `_Dikirim otomatis oleh SIPERKASA Guardian Driver_`
  );
}

// Bersihkan nomor: hapus spasi, strip, dan tanda +.
const normalizePhone = (phone: string) => phone.replace(/[\s\-+]/g, '');

export async function kirimSOSWhatsApp(
  contacts: EmergencyContact[],
  userName: string,
  location: GeoPoint | null,
): Promise<SOSResult> {
  const pesan = encodeURIComponent(buildSOSMessage(userName, location));
  let opened = 0;
  let whatsappAvailable = true;

  for (const contact of contacts) {
    const nomor = normalizePhone(contact.phone);
    // Coba skema app dulu; jika gagal, fallback ke wa.me (browser → WhatsApp).
    const appUrl = `whatsapp://send?phone=${nomor}&text=${pesan}`;
    const webUrl = `https://wa.me/${nomor}?text=${pesan}`;

    try {
      // Langsung openURL (canOpenURL tidak andal di Expo Go iOS).
      await Linking.openURL(appUrl);
      opened += 1;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch {
      try {
        await Linking.openURL(webUrl);
        opened += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch {
        whatsappAvailable = false;
      }
    }
  }

  return { attempted: contacts.length, opened, whatsappAvailable };
}
