import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { initDB } from './server/db.js';
import { apiRouter, seedDemoData } from './server/api.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Database
try {
  initDB();
  seedDemoData();
  console.log('Database initialized successfully');
} catch (e) {
  console.error('Failed to initialize database', e);
}

// Increase payload limit for audio base64 uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use('/api', apiRouter);

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Audio Transcription Endpoint using Gemini AI
 * Accepts audio base64 and transcribes in 26 Indian languages
 */
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', languageHint = 'en' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 payload' });
    }

    // Clean base64 data if it contains data URI prefix
    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = getAIClient();
    if (!ai) {
      console.warn('GEMINI_API_KEY not configured on server');
      return res.status(503).json({
        error: 'AI Transcription service key is not configured',
        fallback: true,
      });
    }

    console.log(`[Transcribe] Processing audio (${cleanBase64.length} chars, ${mimeType}, lang hint: ${languageHint})`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: cleanBase64,
              },
            },
            {
              text: `You are an accurate multilingual speech-to-text audio transcription engine for Indian artisans and craftspeople on the Karigar Setu platform.
Task:
1. Listen to the provided audio file.
2. Transcribe the spoken words accurately into text.
3. Automatically detect the language spoken. The speaker may speak in any of India's 26 recognized languages or dialects (e.g. Hindi, English, Bengali, Marathi, Tamil, Telugu, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Maithili, Santali, Dogri, Kashmiri, Sanskrit, Konkani, Nepali, Sindhi, Bhojpuri, Rajasthani, Chhattisgarhi, etc.) or mixed Hinglish.
4. Output the transcript in the native script of the spoken language (e.g., Devanagari for Hindi/Marathi/Bhojpuri, Bengali script for Bengali/Assamese, Gurmukhi for Punjabi, Tamil for Tamil, Telugu for Telugu, Latin for English/Hinglish).
5. Preserve the artisan's exact words, product details, material names, prices, and cultural terminology.
6. Do NOT translate unless the user explicitly requested translation in speech.
7. Return ONLY the plain transcription text. Do not wrap in markdown quotes, backticks, or prepend "Transcript:".`,
            },
          ],
        },
      ],
    });

    const rawTranscript = response.text ? response.text.trim() : '';
    // Clean any accidental markdown quotes
    const transcript = rawTranscript
      .replace(/^["']|["']$/g, '')
      .replace(/^Transcript:\s*/i, '')
      .trim();

    console.log(`[Transcribe] Successfully transcribed: "${transcript.substring(0, 80)}..."`);

    return res.json({
      success: true,
      transcript,
      detectedLanguage: languageHint,
    });
  } catch (error: any) {
    console.error('[Transcribe Error]', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to transcribe audio',
      fallback: true,
    });
  }
});

/**
 * Karigar Saathi AI Chat Endpoint
 */
app.post('/api/saathi-chat', async (req, res) => {
  try {
    const { query, language = 'en', history = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Missing query' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        success: false,
        fallback: true,
      });
    }

    const systemInstruction = `You are "Karigar Saathi" (कारीगर साथी), a supportive, empathetic, and knowledgeable digital business assistant for Indian master artisans, weavers, and craftspeople.
Platform: Karigar Setu (SIH26090) - AI-driven market linkage and smart cataloging.
Language: Respond naturally in the language requested (${language}), matching the artisan's language (Hindi, English, Bengali, Tamil, Telugu, etc.).
Knowledge Areas:
- Ministry of Textiles Pehchan Artisan Card registration and artisan welfare schemes.
- Fair pricing: calculating material costs + direct crafting hours at fair living wage + margin.
- Institutional buyers: TRIFED, FabIndia, Jaypore, Government e-Marketplace (GeM), export buyers.
- Product photography: lighting tips, background cleanup, mobile studio framing.
- Packaging & logistics for fragile handicrafts (terracotta, bamboo, handloom, metal, woodwork).
Tone: Respectful, encouraging, clear, simple to understand, and practical. Keep responses concise (2-4 sentences max per response) so it is easy to read or listen to on mobile.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nArtisan Query: ${query}` }],
        },
      ],
    });

    return res.json({
      success: true,
      answer: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('[Saathi Chat Error]', error?.message || error);
    return res.json({
      success: false,
      fallback: true,
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
