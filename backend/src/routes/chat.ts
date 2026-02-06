import { Router, Request, Response } from "express";
import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";
import { logger } from "../lib/logger";

const router = Router();

// --- CONFIGURATION ---
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!API_KEY) {
  logger.error("[ArkWork Agent] FATAL: GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// --- SYSTEM PROMPT ---
// A single, robust system prompt that defines the persona and capabilities.
// We let the AI decide how to handle "intent" based on context, rather than brittle if/else code.
const SYSTEM_INSTRUCTION = `
Kamu adalah **ArkWork Agent**, asisten cerdas untuk platform karier **ArkWork**.
Spesialisasi: **Industri Minyak & Gas (Oil & Gas)**, Energi, dan Konstruksi.

**Tugas Utama:**
1.  Membantu jobseeker menemukan karier yang tepat di industri migas.
2.  Menjawab pertanyaan seputar berita/tren energi terkini.
3.  Membantu rekruter (Employer) membuat Job Description (JD) yang menarik.
4.  Memberikan tips interview dan pengembangan karier.

**Gaya Bicara:**
- Profesional, membantu, dan to-the-point.
- Gunakan Bahasa Indonesia yang baik dan formal namun luwes.
- Gunakan format Markdown (bold, list, headings) agar mudah dibaca.

**Batasan:**
- Jika ditanya hal di luar konteks karier/migas, jawab dengan sopan bahwa fokusmu adalah di bidang tersebut, tapi tetap usahakan membantu jika masih relevan (misal soft skill).
- Jangan berikan nasihat hukum/medis/finansial yang mengikat.

**Contoh Template Jawaban:**
- Jika diminta JD: Berikan struktur "Judul", "Deskripsi", "Tanggung Jawab", "Kualifikasi".
- Jika ditanya tips: Berikan poin-poin praktis.
`;

// --- TYPES ---
type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

// --- HELPER: Convert Frontend Messages to Gemini History ---
function transformHistory(messages: Message[]): Content[] {
  // Gemini expects { role: 'user' | 'model', parts: [...] }
  // Filter out empty messages to prevent API errors
  return messages
    .filter(m => m.content && m.content.trim() !== "")
    .map(m => {
      const role = m.role === "user" ? "user" : "model";
      return {
        role: role,
        parts: [{ text: m.content }] as Part[]
      };
    });
}

// --- ROUTE HANDLER ---
router.post("/", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        answer: "Maaf, saya tidak menerima pesan apapun. Silakan ketik sesuatu."
      });
    }

    // 1. Get the last user message (the prompt)
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'user') {
      return res.status(400).json({ answer: "Format pesan salah. Pesan terakhir harus dari user." });
    }

    // 2. Prepare History (excluding the last message which is the prompt)
    const historyMsgs = messages.slice(0, -1);
    const history = transformHistory(historyMsgs);

    // 3. Initialize Model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION
    });

    // 4. Start Chat
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    // 5. Send Message
    logger.info(`[ArkWork Agent] Sending message to ${MODEL_NAME}...`);
    const result = await chat.sendMessage(lastMsg.content);
    const response = await result.response;
    const text = response.text();

    // 6. Return Response
    return res.json({ answer: text });

  } catch (error: any) {
    logger.error("[ArkWork Agent] Error generating response:", error);

    let errorMessage = "Maaf, terjadi kesalahan pada sistem AI kami.";

    // Handle specific Google API errors if needed (e.g. key expired, quota)
    if (error.message?.includes("API key")) {
      errorMessage = "Konfigurasi API Key bermasalah. Hubungi administrator.";
    } else if (error.message?.includes("404")) {
      errorMessage = `Model AI (${MODEL_NAME}) tidak ditemukan atau tidak didukung oleh API Key ini.`;
    } else if (error.message?.includes("429") || error.message?.toLowerCase().includes("quota")) {
      errorMessage = "⚠️ Kuota harian AI habis (429). Mohon coba lagi nanti atau hubungi Admin.";
    }

    return res.status(500).json({
      answer: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;


