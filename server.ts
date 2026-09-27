import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { initDB } from './server/db.js';
import { apiRouter, seedDemoData } from './server/api.js';
import { calculateRealisticFallbackPricing } from './server/pricingEngine.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

// Lazy initialization of Gemini client with recommended telemetry header
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
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
 * AI Pricing Suggestion Endpoint
 * Analyzes market trends, product category, materials, labor hours and suggests competitive, realistic pricing
 */
app.post('/api/suggest-pricing', async (req, res) => {
  const reqData = req.body || {};
  console.log(`[Pricing Engine] Analyzing pricing for "${reqData.name || 'Artisan Craft'}" (${reqData.category || 'General'})`);

  try {
    const ai = getAIClient();

    // If Gemini key is available, call Gemini 3.8 Flash with structured schema
    if (ai) {
      const prompt = `You are the Lead Artisan Pricing Strategist for Karigar Setu, India's platform for master rural artisans, weavers, and craftspeople.
Analyze this craft product and provide realistic, competitive, and fair pricing:

Product Details:
- Title: ${reqData.name || 'Traditional Indian Craft Item'}
- Category: ${reqData.category || 'Handicrafts'}
- Craft Technique: ${reqData.craftType || 'Traditional manual crafting'}
- Raw Materials: ${reqData.material || 'Local authentic natural materials'}
- Dimensions: ${reqData.dimensions || 'Standard artisanal size'}
- Weight: ${reqData.weight || 'Standard craft weight'}
- Production Time: ${reqData.productionTime || 'Handcrafted over multiple days'}
- Regional Lineage: ${reqData.region || 'Indian Artisan Craft Cluster'}
- Description: ${reqData.description || 'Authentic handcrafted piece by Indian master artisan'}
- Artisan Estimated Material Cost: ₹${reqData.materialCost || 'Not specified'}
- Artisan Crafting Hours: ${reqData.labourHours || 'Not specified'}
- Stated Hourly Rate: ₹${reqData.hourlyWage || '65'}/hr
- Stated Packaging & Transit Cost: ₹${reqData.otherCost || '100'}
- Target Sales Channel: ${reqData.salesChannel || 'Direct to Consumer / All Channels'}
- Preferred Language: ${reqData.language || 'en'}

REALISM AND MARKET COMPETITIVENESS RULES:
1. Prices MUST be realistic and reflect the actual Indian handicraft retail & wholesale market (e.g. FabIndia, Jaypore, ONDC, Amazon Karigar, TRIFED).
   - Pottery / Terracotta / Clay: typically ₹350 - ₹1,800 depending on size/firing.
   - Cane & Bamboo Craft: typically ₹650 - ₹2,400.
   - Handloom Silk Textiles / Sarees / Stoles: typically ₹1,800 - ₹12,000.
   - Woodcraft & Toys: typically ₹480 - ₹2,800.
   - Folk / Tribal Paintings (Madhubani, Warli, etc.): typically ₹950 - ₹6,500.
   - Brass, Dhokra & Bell Metal: typically ₹1,200 - ₹5,500.
2. Fair living wage: Ensure the artisan earns a fair hourly wage (typically ₹55 - ₹85/hr for skilled artisans in India).
3. Sustainable profit margin: Direct-to-Consumer price should ensure 30% to 45% net profit margin for the artisan.
4. Wholesale/Bulk price: 15% to 25% lower than D2C price for orders of 50+ units (e.g. for TRIFED or corporate gifting).
5. Premium Boutique / Export price: 30% to 50% above D2C price for upscale metro stores or international export buyers.
6. Return all prices as clean integer Indian Rupees (INR ₹), rounded to the nearest ₹10 or ₹50.
7. Provide realistic competitor benchmarks and actionable market advice for the artisan.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior handicraft market analyst specializing in Indian craft clusters, fair-trade certifications (GI tags, Silk Mark, Craftmark), and realistic pricing models for rural artisans.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedPrice: {
                type: Type.INTEGER,
                description: 'Realistic recommended retail price in INR for direct-to-consumer sales',
              },
              minPrice: {
                type: Type.INTEGER,
                description: 'Realistic minimum viable selling price in INR',
              },
              maxPrice: {
                type: Type.INTEGER,
                description: 'Realistic maximum competitive retail price in INR',
              },
              wholesaleBulkPrice: {
                type: Type.INTEGER,
                description: 'Wholesale unit price in INR for bulk orders of 50+ pieces',
              },
              premiumBoutiquePrice: {
                type: Type.INTEGER,
                description: 'Price in INR if sold in high-end lifestyle boutiques or metro galleries',
              },
              exportGlobalPrice: {
                type: Type.INTEGER,
                description: 'Realistic export price in INR for international buyers',
              },
              estimatedMaterialCost: {
                type: Type.INTEGER,
                description: 'Realistic raw material cost in INR',
              },
              estimatedLaborHours: {
                type: Type.NUMBER,
                description: 'Realistic crafting labor hours required',
              },
              recommendedHourlyWage: {
                type: Type.INTEGER,
                description: 'Fair hourly wage in INR (between ₹55 and ₹85/hr)',
              },
              packagingAndTransitCost: {
                type: Type.INTEGER,
                description: 'Safe packaging and local transit cost in INR',
              },
              profitMarginPercentage: {
                type: Type.INTEGER,
                description: 'Direct artisan profit margin percentage (between 30% and 45%)',
              },
              categoryDemand: {
                type: Type.STRING,
                description: "One of: 'High', 'Moderate', 'Growing', 'Niche'",
              },
              marketTrend: {
                type: Type.STRING,
                description: '1-2 sentence real-world market trend analysis for this craft category',
              },
              pricingStrategyAdvice: {
                type: Type.STRING,
                description: 'Plain-language, empowering advice for the artisan on how to price and position their product',
              },
              benchmarks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 competitor or market benchmarks (e.g., FabIndia, Amazon Karigar, local haat)',
              },
              keyFactors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 market factors influencing this valuation',
              },
              confidenceScore: {
                type: Type.INTEGER,
                description: 'Confidence score percentage (e.g. 94)',
              },
            },
            required: [
              'recommendedPrice',
              'minPrice',
              'maxPrice',
              'wholesaleBulkPrice',
              'premiumBoutiquePrice',
              'exportGlobalPrice',
              'estimatedMaterialCost',
              'estimatedLaborHours',
              'recommendedHourlyWage',
              'packagingAndTransitCost',
              'profitMarginPercentage',
              'categoryDemand',
              'marketTrend',
              'pricingStrategyAdvice',
              'benchmarks',
              'keyFactors',
              'confidenceScore',
            ],
          },
        },
      });

      const parsedText = response.text ? response.text.trim() : '';
      if (parsedText) {
        const aiData = JSON.parse(parsedText);
        const laborCost = Math.round(aiData.estimatedLaborHours * aiData.recommendedHourlyWage);
        const totalCost = aiData.estimatedMaterialCost + laborCost + aiData.packagingAndTransitCost;
        const netProfit = aiData.recommendedPrice - totalCost;

        // Traditional middleman comparison
        const traditionalMiddlemanNetToArtisan = Math.round(totalCost * 1.08);
        const middlemanRetailMarkup = Math.round(aiData.recommendedPrice * 1.6);
        const diff = aiData.recommendedPrice - traditionalMiddlemanNetToArtisan;

        return res.json({
          success: true,
          recommendedPrice: aiData.recommendedPrice,
          priceRange: {
            min: aiData.minPrice,
            max: aiData.maxPrice,
          },
          marketTiers: {
            wholesaleBulk: aiData.wholesaleBulkPrice,
            directConsumerFair: aiData.recommendedPrice,
            premiumBoutique: aiData.premiumBoutiquePrice,
            exportGlobal: aiData.exportGlobalPrice,
          },
          costBreakdown: {
            estimatedMaterialCost: aiData.estimatedMaterialCost,
            estimatedLaborHours: aiData.estimatedLaborHours,
            recommendedHourlyWage: aiData.recommendedHourlyWage,
            packagingAndTransit: aiData.packagingAndTransitCost,
            totalPrimeCost: totalCost,
            artisanNetProfit: netProfit > 0 ? netProfit : Math.round(aiData.recommendedPrice * 0.35),
            profitMarginPercentage: aiData.profitMarginPercentage || 35,
          },
          marketInsights: {
            categoryDemand: aiData.categoryDemand || 'High',
            marketTrend: aiData.marketTrend,
            benchmarks: aiData.benchmarks || [],
            pricingStrategyAdvice: aiData.pricingStrategyAdvice,
            confidenceScore: aiData.confidenceScore || 95,
            keyFactors: aiData.keyFactors || [],
          },
          traditionalVsDirectComparison: {
            traditionalMiddlemanNetToArtisan,
            middlemanRetailMarkup,
            karigarSetuDirectNetToArtisan: aiData.recommendedPrice,
            artisanBenefitMessage:
              reqData.language === 'hi'
                ? `बिचौलियों के बिना बेचने पर आप ₹${diff.toLocaleString('en-IN')} अधिक कमाते हैं!`
                : `By selling directly on Karigar Setu, you earn ₹${diff.toLocaleString('en-IN')} more per piece than traditional trader middlemen!`,
          },
          source: 'gemini-3.8-flash',
        });
      }
    }

    // Fallback to our realistic craft benchmark pricing engine
    const fallbackResult = calculateRealisticFallbackPricing(reqData);
    return res.json(fallbackResult);
  } catch (error: any) {
    console.warn('[Pricing Engine Warning] Falling back to realistic benchmark engine:', error?.message || error);
    const fallbackResult = calculateRealisticFallbackPricing(reqData);
    return res.json(fallbackResult);
  }
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
      model: 'gemini-3.8-flash',
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
      model: 'gemini-3.8-flash',
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
  const server = http.createServer(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
