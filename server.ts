import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// System instructions for the negotiation agent
const NEGOTIATION_AGENT_SYSTEM = `You are an expert AI Procurement Agent representing an enterprise pharmacy chain (HealthCare Plus Pharmacy ERP).
Your goal is to negotiate medicine restocking deals with pharmaceutical vendors.
You are professional, data-driven, courteous yet firm, and focused on total value, not just lowest unit price.
You adhere strictly to safety, demand forecasts, lead times, and expiry risk.

You must respond in JSON with the following structure:
{
  "agentMessage": "Your direct message to the vendor representative",
  "vendorReply": "Realistic simulated vendor response to your offer",
  "outcome": "CONTINUE" | "ACCEPTED" | "REJECTED" | "VENDOR_COUNTER",
  "suggestedCounterPrice": number,
  "suggestedCounterQuantity": number,
  "strategy": "PRICE_FOCUSED" | "QUANTITY_FOCUSED" | "DELIVERY_FOCUSED" | "BALANCED",
  "reasoning": "Crisp explanation of why this counter was proposed and why the current terms make clinical/business sense",
  "dealFitAssessment": "Brief assessment of vendor flexibility and deal viability"
}`;

// Endpoint: AI Negotiation Turn
app.post('/api/gemini/negotiate', async (req: Request, res: Response) => {
  const {
    medicineName,
    currentStock,
    reorderLevel,
    dailySales,
    safetyStock,
    targetPrice,
    maxAcceptablePrice,
    requiredQuantity,
    vendorName,
    vendorOffer,
    turnNumber = 1,
    chatHistory = [],
    strategy = 'BALANCED',
    isRejectionRetry = false,
  } = req.body;

  const prompt = `Context:
- Medicine: ${medicineName}
- Current Stock: ${currentStock} units (Reorder level: ${reorderLevel})
- Daily Sales Velocity: ${dailySales} units/day
- Target Safety Stock: ${safetyStock} units
- Required Order Quantity: ${requiredQuantity} units
- Target Purchase Price: ₹${targetPrice} / unit
- Max Acceptable Cap: ₹${maxAcceptablePrice} / unit
- Vendor: ${vendorName} (Quoted Offer: ₹${vendorOffer.unitPrice}/unit, MOQ: ${vendorOffer.moq}, Delivery: ${vendorOffer.deliveryDays} days)
- Selected Strategy: ${strategy}
- Negotiation Round: ${turnNumber}
- Rejection Retry / Alternative Vendor: ${isRejectionRetry ? 'YES' : 'NO'}

Previous conversation:
${chatHistory.map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`).join('\n')}

Task:
Generate the next AI Agent procurement message and simulate the vendor's realistic counter-response.
Ensure prices are realistic decimals. If turnNumber >= 2 and vendor price is within 2-3% of target, vendor may agree ("ACCEPTED").
If the vendor insists on massive bulk MOQ that increases expiry risk, the agent should refuse overstocking and either negotiate MOQ or evaluate fallback.
Return strictly valid JSON matching the specified schema.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: NEGOTIATION_AGENT_SYSTEM,
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, source: 'gemini', data: parsed });
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON response:', parseError, responseText);
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic negotiation logic:', err?.message || err);
    }
  }

  // Deterministic enterprise negotiation fallback
  const fallback = generateDeterministicNegotiation({
    medicineName,
    requiredQuantity,
    targetPrice,
    maxAcceptablePrice,
    vendorName,
    vendorOffer,
    turnNumber,
    strategy,
    isRejectionRetry,
  });

  return res.json({
    success: true,
    source: 'deterministic_engine',
    data: fallback,
  });
});

// Endpoint: AI Procurement Strategic Analysis
app.post('/api/gemini/analyze-deal', async (req: Request, res: Response) => {
  const { medicine, vendor, finalOffer, originalOffer, savings, dealScore } = req.body;

  if (ai) {
    try {
      const prompt = `Analyze this finalized pharmacy procurement deal:
Medicine: ${medicine.name} (Current stock: ${medicine.currentStock}, Daily sales: ${medicine.dailySales})
Vendor: ${vendor.name} (Reliability: ${vendor.reliability}%, On-Time: ${vendor.onTimeRate}%)
Original Quote: ${originalOffer.quantity} units @ ₹${originalOffer.unitPrice} (Delivery: ${originalOffer.deliveryDays}d)
Final Negotiated: ${finalOffer.quantity} units @ ₹${finalOffer.unitPrice} (Delivery: ${finalOffer.deliveryDays}d)
Total Savings: ₹${savings.totalSavings} (${savings.discountPercent}%)
Deal Fit Score: ${dealScore}/100

Provide a concise 3-part executive summary:
1. "Key Trade-offs & Win": Why this deal is clinically sound.
2. "Inventory & Expiry Safety": Impact on shelf-life and buffer.
3. "Procurement Recommendation": Whether hospital management should approve.
Keep it strictly under 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });

      return res.json({
        success: true,
        source: 'gemini',
        analysis: response.text || '',
      });
    } catch (err: any) {
      console.warn('Gemini analysis failed:', err?.message);
    }
  }

  // Fallback summary
  return res.json({
    success: true,
    source: 'deterministic_engine',
    analysis: `Executive Procurement Assessment: Negotiated ${finalOffer.quantity} units of ${medicine.name} with ${vendor.name} at ₹${finalOffer.unitPrice}/unit (saved ₹${savings.totalSavings}, ${savings.discountPercent}% below list). The lead time of ${finalOffer.deliveryDays} days ensures zero stockout risk while respecting pharmacy shelf-life constraints without over-ordering. Deal Fit Score of ${dealScore}/100 confirms an optimal balance of margin, logistics, and supplier dependability. Human sign-off recommended.`,
  });
});

// Deterministic negotiation generator
function generateDeterministicNegotiation(params: {
  medicineName: string;
  requiredQuantity: number;
  targetPrice: number;
  maxAcceptablePrice: number;
  vendorName: string;
  vendorOffer: { unitPrice: number; moq: number; deliveryDays: number };
  turnNumber: number;
  strategy: string;
  isRejectionRetry: boolean;
}) {
  const {
    medicineName,
    requiredQuantity,
    targetPrice,
    vendorName,
    vendorOffer,
    turnNumber,
  } = params;

  const initialQuoted = vendorOffer.unitPrice;
  const spread = Math.max(0.1, initialQuoted - targetPrice);

  if (turnNumber === 1) {
    const counterOfferPrice = +(initialQuoted - spread * 0.7).toFixed(2);
    return {
      agentMessage: `Hello ${vendorName} sales team. We require an immediate order of ${requiredQuantity} units of ${medicineName} with a guaranteed ${vendorOffer.deliveryDays}-day delivery. In light of our steady monthly purchase volume and prompt Net-30 payment history, can you support a contracted rate of ₹${counterOfferPrice.toFixed(2)} per unit?`,
      vendorReply: `Thank you for reaching out. While our standard catalog rate is ₹${initialQuoted.toFixed(2)}, we value our partnership with your healthcare network. The lowest we can do at ${requiredQuantity} units is ₹${(initialQuoted - spread * 0.35).toFixed(2)} per unit.`,
      outcome: 'VENDOR_COUNTER',
      suggestedCounterPrice: +(initialQuoted - spread * 0.35).toFixed(2),
      suggestedCounterQuantity: requiredQuantity,
      strategy: params.strategy,
      reasoning: `Vendor conceded ${(spread * 0.35).toFixed(2)} from baseline. Negotiation room remains open to bridge the remaining ${(spread * 0.35).toFixed(2)} gap.`,
      dealFitAssessment: 'Vendor demonstrated price flexibility. Proceeding with targeted closing proposal.',
    };
  } else if (turnNumber === 2) {
    const closedPrice = +(targetPrice + spread * 0.25).toFixed(2);
    return {
      agentMessage: `We appreciate your flexibility. If you can meet us at ₹${closedPrice.toFixed(2)} per unit for ${requiredQuantity} units while maintaining the ${vendorOffer.deliveryDays}-day delivery window, our pharmacy procurement committee is prepared to issue an immediate Purchase Order today.`,
      vendorReply: `Understood. Given the commitment for immediate PO issuance and standard payment terms, we confirm approval at ₹${closedPrice.toFixed(2)} per unit. Please issue the PO.`,
      outcome: 'ACCEPTED',
      suggestedCounterPrice: closedPrice,
      suggestedCounterQuantity: requiredQuantity,
      strategy: params.strategy,
      reasoning: `Negotiation successfully closed at ₹${closedPrice.toFixed(2)}, achieving total procurement savings of ₹${((initialQuoted - closedPrice) * requiredQuantity).toFixed(2)} without compromising lead time or MOQ.`,
      dealFitAssessment: 'Terms fully aligned with clinical demand velocity and pharmacy budgetary guidelines.',
    };
  } else {
    const finalPrice = +(targetPrice + spread * 0.2).toFixed(2);
    return {
      agentMessage: `We confirm agreement at ₹${finalPrice.toFixed(2)} for ${requiredQuantity} units. Moving proposal to Chief Pharmacist for formal approval.`,
      vendorReply: `Confirmed. Awaiting Purchase Order. Goods will be dispatched within ${vendorOffer.deliveryDays} days.`,
      outcome: 'ACCEPTED',
      suggestedCounterPrice: finalPrice,
      suggestedCounterQuantity: requiredQuantity,
      strategy: params.strategy,
      reasoning: 'Terms finalized and verified against warehouse receiving schedule.',
      dealFitAssessment: 'Ready for Purchase Order generation upon human approval.',
    };
  }
}

// In development, hook Vite middlewares
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Pharmacy ERP Procurement Server running on http://localhost:${PORT}`);
  });
}

startServer();
