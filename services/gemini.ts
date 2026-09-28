// services/gemini.ts — chat AI asisten keselamatan berkendara (Google Gemini).
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage } from '@/types';

const SYSTEM_PROMPT = `Kamu adalah SIPERKASA AI, asisten keselamatan berkendara untuk aplikasi SIPERKASA: Guardian Driver.
Kamu membantu pengguna dengan: kondisi lalu lintas, tips keselamatan berkendara,
cuaca untuk perjalanan, dan pertanyaan seputar keselamatan di jalan.
Jawab dalam Bahasa Indonesia, singkat dan informatif.
Jangan menjawab pertanyaan di luar topik keselamatan berkendara dan perjalanan.`;

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;
if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
}

/**
 * Kirim pesan ke SIPERKASA AI dengan konteks percakapan sebelumnya.
 * @param history pesan sebelumnya (tanpa pesan baru)
 * @param message pesan baru dari user
 */
export async function askSigapAI(history: ChatMessage[], message: string): Promise<string> {
  if (!model) {
    throw new Error('Gemini API key belum dikonfigurasi di .env (EXPO_PUBLIC_GEMINI_API_KEY).');
  }

  const mappedHistory = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : ('user' as const),
    parts: [{ text: m.text }],
  }));

  // Retry untuk error transient (503 overload / 429 rate / network).
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const chat = model.startChat({ history: mappedHistory });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (e: any) {
      lastError = e;
      const msg = String(e?.message ?? e);
      const transient = /\b503\b|overload|high demand|unavailable|network|timeout/i.test(msg);
      if (transient && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}
