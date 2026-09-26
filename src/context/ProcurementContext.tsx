import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Medicine,
  Vendor,
  VendorOffer,
  NegotiationSession,
  DealEvaluation,
  PurchaseOrder,
  TimelineEvent,
  NegotiationStrategy,
  DealFitScoreBreakdown,
} from '../types';
import {
  INITIAL_MEDICINES,
  INITIAL_VENDORS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_HISTORICAL_DEALS,
} from '../data/mockData';
import {
  calculateStockStatus,
  calculateSmartOrderQuantity,
  generateVendorOffers,
  calculateDealFitScore,
  SmartQuantityResult,
} from '../services/procurementCalculations';

interface ProcurementContextType {
  medicines: Medicine[];
  vendors: Vendor[];
  activeMedicine: Medicine;
  smartQuantity: SmartQuantityResult;
  vendorOffers: VendorOffer[];
  dealFitScores: Record<string, DealFitScoreBreakdown>;
  activeNegotiation: NegotiationSession | null;
  deals: DealEvaluation[];
  purchaseOrders: PurchaseOrder[];
  timeline: TimelineEvent[];
  demoRunning: boolean;
  demoCurrentStep: number;
  demoTotalSteps: number;
  demoStepMessage: string;
  selectMedicine: (medicineId: string) => void;
  startNegotiationWithVendor: (vendorId: string, strategy?: NegotiationStrategy) => void;
  sendManualCounterOffer: (proposedPrice: number, proposedQuantity: number) => Promise<void>;
  advanceNegotiationTurn: () => Promise<void>;
  simulateRejectionAndFallback: () => Promise<void>;
  approveDealAndWriteBackERP: (dealId: string) => void;
  rejectDeal: (dealId: string, reason?: string) => void;
  renegotiateDeal: (dealId: string) => void;
  runSmartProcurementDemo: (medicineId?: string) => Promise<void>;
  stopDemo: () => void;
  resetAllData: () => void;
  updateMedicineData: (medicineId: string, updates: Partial<Medicine>) => void;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Primary State
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    return INITIAL_MEDICINES.map((m) => ({
      ...m,
      status: calculateStockStatus(m),
    }));
  });

  const [vendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [activeMedicineId, setActiveMedicineId] = useState<string>('MED-101'); // Paracetamol 500mg default
  const [activeNegotiation, setActiveNegotiation] = useState<NegotiationSession | null>(null);
  const [deals, setDeals] = useState<DealEvaluation[]>(INITIAL_HISTORICAL_DEALS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      id: 'EVT-INIT-1',
      timestamp: '2026-09-24 09:00',
      title: 'Pharmacy ERP Restock Engine Initialized',
      description: 'Continuous stock velocity & expiration surveillance active across 18 catalog lines.',
      stage: 'INVENTORY_ANALYSIS',
    },
    {
      id: 'EVT-INIT-2',
      timestamp: '2026-09-24 09:05',
      title: 'Low Stock Flagged on Paracetamol 500mg',
      description: 'Current stock 18 units below reorder threshold (50 units). Immediate replenishment recommended.',
      stage: 'LOW_STOCK_DETECTED',
    },
  ]);

  // Demo Automation State
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [demoCurrentStep, setDemoCurrentStep] = useState<number>(0);
  const demoTotalSteps = 15;
  const [demoStepMessage, setDemoStepMessage] = useState<string>('');

  // Active medicine object
  const activeMedicine = useMemo(() => {
    const found = medicines.find((m) => m.id === activeMedicineId) || medicines[0];
    return {
      ...found,
      status: calculateStockStatus(found),
    };
  }, [medicines, activeMedicineId]);

  // Dynamic calculations for active medicine
  const smartQuantity = useMemo(() => {
    return calculateSmartOrderQuantity(activeMedicine);
  }, [activeMedicine]);

  const vendorOffers = useMemo(() => {
    return generateVendorOffers(activeMedicine, vendors, smartQuantity.finalRecommended);
  }, [activeMedicine, vendors, smartQuantity.finalRecommended]);

  // Calculate Deal Fit Scores for each vendor offer
  const dealFitScores = useMemo(() => {
    const scores: Record<string, DealFitScoreBreakdown> = {};
    vendorOffers.forEach((offer) => {
      const vendor = vendors.find((v) => v.id === offer.vendorId);
      if (vendor) {
        scores[offer.vendorId] = calculateDealFitScore(
          offer,
          activeMedicine,
          vendor,
          smartQuantity.finalRecommended
        );
      }
    });
    return scores;
  }, [vendorOffers, activeMedicine, vendors, smartQuantity.finalRecommended]);

  // Helper to add timeline event
  const addTimelineEvent = (
    title: string,
    description: string,
    stage: TimelineEvent['stage'],
    metadata?: Record<string, any>
  ) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeString,
      title,
      description,
      stage,
      metadata,
    };
    setTimeline((prev) => [newEvent, ...prev]);
  };

  // Select a medicine
  const selectMedicine = (medicineId: string) => {
    setActiveMedicineId(medicineId);
    const med = medicines.find((m) => m.id === medicineId);
    if (med) {
      addTimelineEvent(
        `Medicine Selected: ${med.name}`,
        `Current stock: ${med.currentStock} units | Reorder level: ${med.reorderLevel} units | Daily sales: ${med.dailySales}`,
        'INVENTORY_ANALYSIS'
      );
    }
  };

  // Update medicine in ERP
  const updateMedicineData = (medicineId: string, updates: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medicineId) {
          const updated = { ...m, ...updates };
          return {
            ...updated,
            status: calculateStockStatus(updated),
          };
        }
        return m;
      })
    );
  };

  // Start negotiation session with a vendor
  const startNegotiationWithVendor = (vendorId: string, strategy: NegotiationStrategy = 'BALANCED') => {
    const vendor = vendors.find((v) => v.id === vendorId);
    const offer = vendorOffers.find((o) => o.vendorId === vendorId);
    if (!vendor || !offer) return;

    // Determine target price and maximum acceptable ceiling
    const targetPrice = +(offer.unitPrice * 0.95).toFixed(2);
    const maxAcceptable = +(offer.unitPrice * 1.02).toFixed(2);

    const initialSession: NegotiationSession = {
      id: `NEG-${Date.now()}`,
      procurementRequestId: `REQ-${Date.now()}`,
      medicineId: activeMedicine.id,
      medicineName: activeMedicine.name,
      requiredQuantity: offer.quantity,
      targetPrice,
      maxAcceptablePrice: maxAcceptable,
      selectedVendorId: vendor.id,
      selectedVendorName: vendor.name,
      initialOffer: offer,
      currentCounterPrice: offer.unitPrice,
      currentCounterQuantity: offer.quantity,
      strategy,
      status: 'IN_PROGRESS',
      messages: [
        {
          id: `MSG-SYS-1`,
          sender: 'SYSTEM',
          senderName: 'Procurement AI Orchestrator',
          text: `Negotiation session initiated with ${vendor.name}. Objective: procure ${offer.quantity} units of ${activeMedicine.name}. Quoted list price: ₹${offer.unitPrice.toFixed(2)}/unit. Target: ₹${targetPrice.toFixed(2)}. Strategy: ${strategy}.`,
          timestamp: 'Just now',
        },
      ],
      currentTurn: 0,
      rejectionCount: 0,
      aiReasoning: `Initiating ${strategy.toLowerCase().replace('_', ' ')} negotiation. Baseline quote is ₹${offer.unitPrice.toFixed(2)}. Aiming for ₹${targetPrice.toFixed(2)} to maximize pharmacy margin while locking in ${offer.deliveryDays}-day lead time.`,
      currentActivityState: 'Preparing opening proposal...',
      startedAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString(),
    };

    setActiveNegotiation(initialSession);
    addTimelineEvent(
      `Negotiation Commenced with ${vendor.name}`,
      `Quoted: ₹${offer.unitPrice}/unit | Strategy: ${strategy} | Quantity: ${offer.quantity} units`,
      'NEGOTIATION_STARTED'
    );
  };

  // Advance negotiation by 1 turn using Gemini API or fallback
  const advanceNegotiationTurn = async () => {
    if (!activeNegotiation) return;

    const session = activeNegotiation;
    const nextTurn = session.currentTurn + 1;

    // Set activity state
    setActiveNegotiation((prev) =>
      prev ? { ...prev, currentActivityState: 'Analyzing vendor response & calculating counter-offer...' } : null
    );

    try {
      const response = await fetch('/api/gemini/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: session.medicineName,
          currentStock: activeMedicine.currentStock,
          reorderLevel: activeMedicine.reorderLevel,
          dailySales: activeMedicine.dailySales,
          safetyStock: activeMedicine.safetyStock,
          targetPrice: session.targetPrice,
          maxAcceptablePrice: session.maxAcceptablePrice,
          requiredQuantity: session.requiredQuantity,
          vendorName: session.selectedVendorName,
          vendorOffer: session.initialOffer,
          turnNumber: nextTurn,
          strategy: session.strategy,
          chatHistory: session.messages.map((m) => ({ sender: m.senderName, text: m.text })),
        }),
      });

      const resData = await response.json();
      const payload = resData.data;

      const aiMsg: any = {
        id: `MSG-AI-${Date.now()}`,
        sender: 'AI_AGENT',
        senderName: 'HealthCare AI Agent',
        text: payload.agentMessage,
        timestamp: new Date().toLocaleTimeString(),
        proposedPrice: payload.suggestedCounterPrice,
        proposedQuantity: payload.suggestedCounterQuantity,
      };

      const vendorMsg: any = {
        id: `MSG-VEND-${Date.now()}`,
        sender: 'VENDOR',
        senderName: `${session.selectedVendorName} Representative`,
        text: payload.vendorReply,
        timestamp: new Date().toLocaleTimeString(),
        proposedPrice: payload.suggestedCounterPrice,
      };

      const updatedStatus = payload.outcome === 'ACCEPTED' ? 'ACCEPTED' : 'IN_PROGRESS';

      setActiveNegotiation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentTurn: nextTurn,
          status: updatedStatus,
          messages: [...prev.messages, aiMsg, vendorMsg],
          currentCounterPrice: payload.suggestedCounterPrice || prev.currentCounterPrice,
          aiReasoning: payload.reasoning || prev.aiReasoning,
          currentActivityState:
            payload.outcome === 'ACCEPTED' ? 'Agreement reached!' : 'Vendor counter received. Evaluating room...',
          updatedAt: new Date().toLocaleTimeString(),
        };
      });

      addTimelineEvent(
        `Counter-Offer Round #${nextTurn}: ${session.selectedVendorName}`,
        `AI proposed ₹${payload.suggestedCounterPrice}. Vendor responded: "${payload.vendorReply.slice(0, 80)}..."`,
        'COUNTER_OFFER'
      );

      // If accepted, generate deal evaluation ready for human approval
      if (payload.outcome === 'ACCEPTED') {
        const finalPrice = payload.suggestedCounterPrice;
        const finalQty = session.requiredQuantity;
        const origPrice = session.initialOffer.unitPrice;
        const origTotal = +(origPrice * finalQty).toFixed(2);
        const finalTotal = +(finalPrice * finalQty).toFixed(2);
        const savings = +(origTotal - finalTotal).toFixed(2);
        const discountPct = +(((origPrice - finalPrice) / origPrice) * 100).toFixed(1);

        const vendor = vendors.find((v) => v.id === session.selectedVendorId)!;
        const fit = dealFitScores[session.selectedVendorId] || calculateDealFitScore(
          session.initialOffer,
          activeMedicine,
          vendor,
          finalQty
        );

        const newDeal: DealEvaluation = {
          id: `DEAL-${Date.now()}`,
          procurementRequestId: session.procurementRequestId,
          medicineId: activeMedicine.id,
          medicineName: activeMedicine.name,
          vendorId: session.selectedVendorId,
          vendorName: session.selectedVendorName,
          originalQuantity: finalQty,
          finalQuantity: finalQty,
          originalUnitPrice: origPrice,
          finalUnitPrice: finalPrice,
          originalTotalCost: origTotal,
          finalTotalCost: finalTotal,
          totalSavings: savings,
          discountPercentage: discountPct,
          deliveryDays: session.initialOffer.deliveryDays,
          moq: session.initialOffer.moq,
          fitScore: fit,
          expiryRiskLevel: 'LOW',
          vendorReliability: vendor.reliability,
          approvalStatus: 'PENDING',
          aiExecutiveSummary: payload.reasoning,
          createdAt: new Date().toISOString().split('T')[0],
        };

        setDeals((prev) => [newDeal, ...prev]);
        addTimelineEvent(
          `Deal Finalized: Ready for Human Approval`,
          `Unit price reduced from ₹${origPrice.toFixed(2)} to ₹${finalPrice.toFixed(2)} (Saved ₹${savings.toFixed(2)}). Sent to Human Approval queue.`,
          'DEAL_FINALIZED'
        );
      }
    } catch (err) {
      console.error('Error during negotiation step:', err);
    }
  };

  // Manual counter offer input by user
  const sendManualCounterOffer = async (proposedPrice: number, proposedQuantity: number) => {
    if (!activeNegotiation) return;
    const session = activeNegotiation;
    const nextTurn = session.currentTurn + 1;

    const userAiMsg: any = {
      id: `MSG-USER-${Date.now()}`,
      sender: 'AI_AGENT',
      senderName: 'HealthCare AI Agent (Manual Input)',
      text: `We propose a revised price of ₹${proposedPrice.toFixed(2)} for ${proposedQuantity} units with ${session.initialOffer.deliveryDays}-day delivery.`,
      timestamp: new Date().toLocaleTimeString(),
      proposedPrice,
      proposedQuantity,
    };

    // Calculate vendor reaction
    const priceGap = proposedPrice - session.targetPrice;
    let vendorReply = '';
    let outcome = 'IN_PROGRESS';

    if (proposedPrice >= session.initialOffer.unitPrice * 0.96) {
      vendorReply = `That is within our authorized margin. We accept ₹${proposedPrice.toFixed(2)} for ${proposedQuantity} units.`;
      outcome = 'ACCEPTED';
    } else {
      vendorReply = `₹${proposedPrice.toFixed(2)} is below our floor margin. Best we can do is ₹${(proposedPrice + 0.20).toFixed(2)}.`;
    }

    const vendorMsg: any = {
      id: `MSG-VEND-${Date.now()}`,
      sender: 'VENDOR',
      senderName: `${session.selectedVendorName} Representative`,
      text: vendorReply,
      timestamp: new Date().toLocaleTimeString(),
      proposedPrice: outcome === 'ACCEPTED' ? proposedPrice : proposedPrice + 0.20,
    };

    setActiveNegotiation((prev) =>
      prev
        ? {
            ...prev,
            currentTurn: nextTurn,
            messages: [...prev.messages, userAiMsg, vendorMsg],
            currentCounterPrice: proposedPrice,
            status: outcome === 'ACCEPTED' ? 'ACCEPTED' : 'IN_PROGRESS',
            updatedAt: new Date().toLocaleTimeString(),
          }
        : null
    );
  };

  // Handle vendor rejection and fallback scenario (Major USP!)
  const simulateRejectionAndFallback = async () => {
    if (!activeNegotiation) return;
    const currentSession = activeNegotiation;

    // 1. Vendor rejects firmly
    const rejectionMsg: any = {
      id: `MSG-REJ-${Date.now()}`,
      sender: 'VENDOR',
      senderName: `${currentSession.selectedVendorName} Representative`,
      text: `Unfortunately, our pricing committee has reviewed your counter-offer. ₹${currentSession.targetPrice.toFixed(2)} is not possible. Our listed catalog price is fixed for this quarter.`,
      timestamp: new Date().toLocaleTimeString(),
    };

    // 2. AI Agent recognizes rejection and initiates fallback
    const systemNotice: any = {
      id: `MSG-SYS-REJ-${Date.now()}`,
      sender: 'SYSTEM',
      senderName: 'Procurement AI Orchestrator',
      text: `Negotiation unsuccessful with ${currentSession.selectedVendorName}. AI evaluation: Exceeds threshold. Automatically routing to next highest Deal-Fit vendor...`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setActiveNegotiation((prev) =>
      prev
        ? {
            ...prev,
            status: 'REJECTED',
            rejectionCount: prev.rejectionCount + 1,
            messages: [...prev.messages, rejectionMsg, systemNotice],
            aiReasoning: `Vendor ${currentSession.selectedVendorName} refused to negotiate below catalog price. Proceeding with fallback protocol to maintain restocking SLA.`,
            currentActivityState: 'Evaluating alternative vendors...',
          }
        : null
    );

    addTimelineEvent(
      `Negotiation Rejected by ${currentSession.selectedVendorName}`,
      `Vendor refused ₹${currentSession.targetPrice.toFixed(2)}. AI initiated fallback protocol.`,
      'VENDOR_REJECTED'
    );

    // Short pause then switch to next best vendor
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Find next vendor in offer list
    const otherOffers = vendorOffers.filter((o) => o.vendorId !== currentSession.selectedVendorId);
    // Sort by Deal Fit Score
    otherOffers.sort((a, b) => {
      const scoreA = dealFitScores[a.vendorId]?.overallScore || 0;
      const scoreB = dealFitScores[b.vendorId]?.overallScore || 0;
      return scoreB - scoreA;
    });

    const fallbackOffer = otherOffers[0];
    const fallbackVendor = vendors.find((v) => v.id === fallbackOffer.vendorId)!;

    const fallbackTarget = +(fallbackOffer.unitPrice * 0.96).toFixed(2);

    const fallbackSession: NegotiationSession = {
      id: `NEG-FALLBACK-${Date.now()}`,
      procurementRequestId: currentSession.procurementRequestId,
      medicineId: activeMedicine.id,
      medicineName: activeMedicine.name,
      requiredQuantity: fallbackOffer.quantity,
      targetPrice: fallbackTarget,
      maxAcceptablePrice: fallbackOffer.unitPrice,
      selectedVendorId: fallbackVendor.id,
      selectedVendorName: fallbackVendor.name,
      initialOffer: fallbackOffer,
      currentCounterPrice: fallbackOffer.unitPrice,
      currentCounterQuantity: fallbackOffer.quantity,
      strategy: 'BALANCED',
      status: 'IN_PROGRESS',
      messages: [
        {
          id: `MSG-FALLBACK-1`,
          sender: 'SYSTEM',
          senderName: 'Procurement AI Orchestrator',
          text: `[FALLBACK ACTIVATED] Switched procurement stream to ${fallbackVendor.name} (Reliability: ${fallbackVendor.reliability}%, Lead Time: ${fallbackOffer.deliveryDays}d). Commencing negotiation round.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      currentTurn: 0,
      rejectionCount: 1,
      fallbackVendorTried: true,
      aiReasoning: `Fallback vendor ${fallbackVendor.name} offers superior delivery reliability and matches required demand profile. Initiating closing proposal.`,
      currentActivityState: `Engaging ${fallbackVendor.name}...`,
      startedAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString(),
    };

    setActiveNegotiation(fallbackSession);
    addTimelineEvent(
      `Fallback Vendor Engaged: ${fallbackVendor.name}`,
      `Selected based on high Deal Fit Score (${dealFitScores[fallbackVendor.id]?.overallScore}/100) and guaranteed delivery.`,
      'FALLBACK_VENDOR'
    );
  };

  // Human Approves Deal -> Generates PO -> ERP WRITE-BACK
  const approveDealAndWriteBackERP = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    const medicine = medicines.find((m) => m.id === deal.medicineId);
    const vendor = vendors.find((v) => v.id === deal.vendorId);
    if (!medicine || !vendor) return;

    // 1. Update deal status
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              approvalStatus: 'APPROVED',
              approvalDate: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );

    // 2. Generate Purchase Order
    const poNumber = `PO-2026-${Math.floor(1030 + Math.random() * 900)}`;
    const prevStock = medicine.currentStock;
    const addedStock = deal.finalQuantity;
    const newStock = prevStock + addedStock;

    const subtotal = +(deal.finalUnitPrice * deal.finalQuantity).toFixed(2);
    const taxAmount = +(subtotal * 0.05).toFixed(2); // 5% GST on medicines
    const grandTotal = +(subtotal + taxAmount).toFixed(2);

    const deliveryDateObj = new Date();
    deliveryDateObj.setDate(deliveryDateObj.getDate() + deal.deliveryDays);
    const deliveryDateStr = deliveryDateObj.toISOString().split('T')[0];

    const newPO: PurchaseOrder = {
      poNumber,
      date: new Date().toISOString().split('T')[0],
      dealId: deal.id,
      pharmacyInfo: {
        name: 'Apollo Care Central Pharmacy ERP',
        license: 'DL-20B/21B-MH-449102',
        branch: 'Main Multispecialty Hub, Floor 1',
        address: '74 Healthcare Avenue, Medical District, Mumbai 400012',
        gstin: '27AAAAA0000A1Z5',
      },
      vendorInfo: {
        id: vendor.id,
        name: vendor.name,
        contact: vendor.contactPerson,
        email: vendor.email,
        address: 'Pharma Logistics Hub, Bhiwandi, Maharashtra',
        gstin: '27AABCV1234F1Z8',
      },
      items: [
        {
          medicineId: medicine.id,
          medicineName: medicine.name,
          genericName: medicine.genericName,
          quantity: deal.finalQuantity,
          unitPrice: deal.finalUnitPrice,
          discountPercent: deal.discountPercentage,
          taxPercent: 5.0,
          lineTotal: grandTotal,
        },
      ],
      subtotal,
      taxAmount,
      grandTotal,
      deliveryDate: deliveryDateStr,
      paymentTerms: vendor.paymentTerms,
      status: 'ISSUED',
      erpSynced: true,
      erpSyncTimestamp: new Date().toLocaleTimeString(),
      previousStock: prevStock,
      newStock,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);

    // 3. ERP WRITE-BACK: Directly update medicine stock in simulated ERP database!
    updateMedicineData(medicine.id, {
      currentStock: newStock,
    });

    addTimelineEvent(
      `Purchase Order Generated: ${poNumber}`,
      `Authorized order of ${deal.finalQuantity} units with ${deal.vendorName} at ₹${deal.finalUnitPrice.toFixed(2)}/unit (Grand total ₹${grandTotal.toFixed(2)}).`,
      'PO_GENERATED'
    );

    addTimelineEvent(
      `ERP Write-Back Completed: ${medicine.name}`,
      `Stock updated from ${prevStock} to ${newStock} units (+${addedStock} units received from ${deal.vendorName}). Inventory status: NORMAL.`,
      'ERP_UPDATED'
    );
  };

  // Human Rejects Deal
  const rejectDeal = (dealId: string, reason: string = 'Budget constraints or delivery schedule mismatch') => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              approvalStatus: 'REJECTED',
              rejectionReason: reason,
            }
          : d
      )
    );

    addTimelineEvent(
      `Deal Rejected by Human Approver`,
      `Deal ${dealId} rejected. Reason: ${reason}. Restocking remains open.`,
      'PENDING_APPROVAL'
    );
  };

  // Re-negotiate deal
  const renegotiateDeal = (dealId: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;
    startNegotiationWithVendor(deal.vendorId, 'PRICE_FOCUSED');
  };

  // Stop Demo
  const stopDemo = () => {
    setDemoRunning(false);
    setDemoStepMessage('Demo stopped.');
  };

  // 15-Step End-to-End Autonomous Restocking Demo
  const runSmartProcurementDemo = async (targetMedicineId: string = 'MED-101') => {
    if (demoRunning) return;
    setDemoRunning(true);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Step 1: Select low-stock medicine
      setDemoCurrentStep(1);
      setDemoStepMessage('Step 1/15: Selecting Paracetamol 500mg from critical restock queue...');
      selectMedicine(targetMedicineId);
      await sleep(1200);

      // Step 2: Analyze inventory
      setDemoCurrentStep(2);
      setDemoStepMessage('Step 2/15: Analyzing inventory parameters: Stock 18, Reorder 50, Daily Sales 12...');
      addTimelineEvent('Inventory Analysis Complete', 'Paracetamol 500mg has 1.5 days of runway left.', 'INVENTORY_ANALYSIS');
      await sleep(1300);

      // Step 3: Low stock / Expiry Detection
      setDemoCurrentStep(3);
      setDemoStepMessage('Step 3/15: Stock level is CRITICAL (18 <= 50). Expiry date 2027-08-15 is healthy.');
      addTimelineEvent('Low Stock Alert Confirmed', 'Reorder trigger activated.', 'LOW_STOCK_DETECTED');
      await sleep(1200);

      // Step 4: Calculate Smart Quantity
      setDemoCurrentStep(4);
      setDemoStepMessage('Step 4/15: Smart Quantity Formula: Lead Demand (36) + Safety (20) - Stock (18) = 38 units.');
      addTimelineEvent('Smart Quantity Calculated', 'Calculated 38 units. Adjusting for vendor minimums.', 'SMART_QUANTITY');
      await sleep(1400);

      // Step 5: Fetch Vendor Offers
      setDemoCurrentStep(5);
      setDemoStepMessage('Step 5/15: Polling catalog quotes: MedSupply (₹10.50, 1d), PharmaDirect (₹9.80, 4d), MediCore (₹10.20, 2d), HealthKart (₹9.50, 5d)...');
      addTimelineEvent('Multi-Vendor Offers Received', '4 vendor bids retrieved.', 'OFFERS_RECEIVED');
      await sleep(1500);

      // Step 6: Compare Vendors & Deal Fit Score
      setDemoCurrentStep(6);
      setDemoStepMessage('Step 6/15: Calculating Deal Fit Scores. Demonstrating CHEAPEST ≠ BEST: HealthKart (5d lead time) risks stockout; MedSupply has highest score (94/100)!');
      await sleep(1600);

      // Step 7: Start AI Negotiation
      setDemoCurrentStep(7);
      setDemoStepMessage('Step 7/15: AI Procurement Agent initiates negotiation with MedSupply for 60 units...');
      startNegotiationWithVendor('VEND-01', 'BALANCED');
      await sleep(1400);

      // Step 8: Send AI Counter-Offer Round 1
      setDemoCurrentStep(8);
      setDemoStepMessage('Step 8/15: AI Agent sends formal counter-proposal: ₹10.20/unit citing prompt payment history...');
      await advanceNegotiationTurn();
      await sleep(1600);

      // Step 9: Simulate vendor response
      setDemoCurrentStep(9);
      setDemoStepMessage('Step 9/15: Vendor counters at ₹10.40. AI Agent pushes closing proposal for ₹10.25...');
      await advanceNegotiationTurn();
      await sleep(1600);

      // Step 10: Vendor Accepts Deal
      setDemoCurrentStep(10);
      setDemoStepMessage('Step 10/15: MedSupply accepts ₹10.25 per unit! Negotiation successfully closed.');
      await sleep(1400);

      // Step 11: Deal Evaluation
      setDemoCurrentStep(11);
      setDemoStepMessage('Step 11/15: Evaluating deal: 60 units × ₹10.25 = ₹615. Total Savings: ₹15.00 (vs ₹630 list).');
      await sleep(1300);

      // Step 12: Move to Human Approval Queue
      setDemoCurrentStep(12);
      setDemoStepMessage('Step 12/15: Routing finalized deal to Chief Pharmacist for required Human-in-the-Loop Approval...');
      await sleep(1400);

      // Step 13: Chief Pharmacist Approves
      setDemoCurrentStep(13);
      setDemoStepMessage('Step 13/15: Human Approver reviews Deal Fit Score (94/100) and clicks APPROVE...');
      // Find the most recent pending deal
      await sleep(1500);

      // We trigger approval on the newly created deal
      setDeals((prev) => {
        const targetDeal = prev.find((d) => d.approvalStatus === 'PENDING');
        if (targetDeal) {
          setTimeout(() => {
            approveDealAndWriteBackERP(targetDeal.id);
          }, 400);
        }
        return prev;
      });

      // Step 14: Purchase Order Generated
      setDemoCurrentStep(14);
      setDemoStepMessage('Step 14/15: Purchase Order generated and dispatched to MedSupply. Print-ready invoice ready.');
      await sleep(1500);

      // Step 15: ERP Write-Back Completed!
      setDemoCurrentStep(15);
      setDemoStepMessage('Step 15/15: ERP Write-back complete! Paracetamol inventory updated from 18 to 78 units (+60 units).');
      await sleep(2000);

      setDemoStepMessage('Complete 15-step Smart Procurement Restocking & Bargaining workflow finished successfully!');
    } catch (err) {
      console.error('Error in demo run:', err);
    } finally {
      setDemoRunning(false);
    }
  };

  // Reset demo data
  const resetAllData = () => {
    setMedicines(
      INITIAL_MEDICINES.map((m) => ({
        ...m,
        status: calculateStockStatus(m),
      }))
    );
    setActiveMedicineId('MED-101');
    setActiveNegotiation(null);
    setDeals(INITIAL_HISTORICAL_DEALS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setTimeline([
      {
        id: 'EVT-RESET',
        timestamp: new Date().toLocaleTimeString(),
        title: 'Demo Environment Reset',
        description: 'All inventories, previous purchase orders, and mock sessions restored to default demo state.',
        stage: 'INVENTORY_ANALYSIS',
      },
    ]);
    setDemoRunning(false);
    setDemoCurrentStep(0);
    setDemoStepMessage('');
  };

  return (
    <ProcurementContext.Provider
      value={{
        medicines,
        vendors,
        activeMedicine,
        smartQuantity,
        vendorOffers,
        dealFitScores,
        activeNegotiation,
        deals,
        purchaseOrders,
        timeline,
        demoRunning,
        demoCurrentStep,
        demoTotalSteps,
        demoStepMessage,
        selectMedicine,
        startNegotiationWithVendor,
        sendManualCounterOffer,
        advanceNegotiationTurn,
        simulateRejectionAndFallback,
        approveDealAndWriteBackERP,
        rejectDeal,
        renegotiateDeal,
        runSmartProcurementDemo,
        stopDemo,
        resetAllData,
        updateMedicineData,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
