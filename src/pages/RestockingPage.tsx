import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  AlertCircle,
  Truck,
  ShieldCheck,
  Scale,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Info,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';
import { NegotiationStrategy } from '../types';

interface RestockingPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const RestockingPage: React.FC<RestockingPageProps> = ({ setActiveTab }) => {
  const {
    activeMedicine,
    medicines,
    selectMedicine,
    smartQuantity,
    vendorOffers,
    dealFitScores,
    startNegotiationWithVendor,
  } = useProcurement();

  const [selectedStrategy, setSelectedStrategy] = useState<NegotiationStrategy>('BALANCED');
  const [selectedVendorForRestock, setSelectedVendorForRestock] = useState<string>('VEND-01');

  // Find vendor with highest Deal Fit Score
  const sortedOffers = [...vendorOffers].sort((a, b) => {
    const scoreA = dealFitScores[a.vendorId]?.overallScore || 0;
    const scoreB = dealFitScores[b.vendorId]?.overallScore || 0;
    return scoreB - scoreA;
  });

  const topFitOffer = sortedOffers[0];

  const handleInitiateNegotiation = (vendorId: string) => {
    startNegotiationWithVendor(vendorId, selectedStrategy);
    setActiveTab('negotiations');
  };

  return (
    <div className="space-y-6">
      {/* Header & Medicine Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Smart Restocking & Deal Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Demand & Expiry Aware
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recommends exact clinical buffer quantities and evaluates multi-vendor deals beyond raw price.
          </p>
        </div>

        {/* Medicine Dropdown Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Select Medicine:</span>
          <select
            value={activeMedicine.id}
            onChange={(e) => selectMedicine(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} (Stock: {m.currentStock}, Reorder: {m.reorderLevel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Grid: Left: Smart Quantity Formula Engine, Right: Expiry & Storage Safeguard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Smart Quantity Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Smart Quantity Calculation Formula</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
              SKU: {activeMedicine.id}
            </span>
          </div>

          {/* Step-by-Step Mathematical Formula Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Step 1: Lead Time Demand */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Lead Time Demand</span>
              <p className="font-mono text-xs text-slate-500 mt-1">dailySales × leadTime</p>
              <div className="mt-1 font-bold text-slate-800 text-base">
                {activeMedicine.dailySales} × {activeMedicine.leadTime} = {smartQuantity.leadTimeDemand}
                <span className="text-[10px] text-slate-400 font-normal ml-1">units</span>
              </div>
            </div>

            {/* Step 2: Safety Stock */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Safety Stock</span>
              <p className="font-mono text-xs text-slate-500 mt-1">Buffer against surge</p>
              <div className="mt-1 font-bold text-slate-800 text-base">
                {smartQuantity.safetyStock}
                <span className="text-[10px] text-slate-400 font-normal ml-1">units</span>
              </div>
            </div>

            {/* Step 3: Required Stock */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Required Stock</span>
              <p className="font-mono text-xs text-slate-500 mt-1">LeadDemand + Safety</p>
              <div className="mt-1 font-bold text-slate-800 text-base">
                {smartQuantity.leadTimeDemand} + {smartQuantity.safetyStock} = {smartQuantity.requiredStock}
                <span className="text-[10px] text-slate-400 font-normal ml-1">units</span>
              </div>
            </div>

            {/* Step 4: Recommended Order */}
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">4. Final Recommended</span>
              <p className="font-mono text-xs text-emerald-700 mt-1">Required - CurrentStock</p>
              <div className="mt-1 font-black text-emerald-700 text-base">
                {smartQuantity.requiredStock} - {activeMedicine.currentStock} = {smartQuantity.finalRecommended}
                <span className="text-[10px] text-emerald-700 font-normal ml-1">units</span>
              </div>
            </div>
          </div>

          {/* AI Explanation Banner */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Procurement Reasoning Engine</span>
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              "{smartQuantity.explanation}"
            </p>
            <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{smartQuantity.riskAssessment}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Expiry & Storage Safeguards (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Expiry & Storage Intelligence</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch Shelf Life</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-mono font-bold text-slate-800">{activeMedicine.expiryDate}</span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                  Batch #{activeMedicine.batchNumber}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Warehouse Capacity</span>
              <div className="flex justify-between items-center mt-1">
                <span className="font-bold text-slate-800">
                  {activeMedicine.currentStock} / {activeMedicine.maxStorageCapacity} units
                </span>
                <span className="text-slate-500 text-[11px]">
                  {Math.round((activeMedicine.currentStock / activeMedicine.maxStorageCapacity) * 100)}% utilized
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (activeMedicine.currentStock / activeMedicine.maxStorageCapacity) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-teal-600" />
                <span>Anti-Overstock Protection</span>
              </div>
              <p className="text-[11px] leading-relaxed text-teal-800">
                AI prevents bulk vendor upsells that push shelf-life beyond 90 days of projected demand.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 10 & 11: Multi-Vendor Offers & Deal Fit Score Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Vendor Restock Quotations</h3>
            <p className="text-xs text-slate-500">
              Comparing offers against demand fit, lead times, MOQ thresholds, and supplier reliability.
            </p>
          </div>

          {/* Strategy Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Negotiation Strategy:</span>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value as NegotiationStrategy)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-800 focus:outline-none"
            >
              <option value="BALANCED">Balanced (Margin & SLA)</option>
              <option value="PRICE_FOCUSED">Price Focused (Aggressive)</option>
              <option value="DELIVERY_FOCUSED">Delivery Focused (Urgent)</option>
              <option value="QUANTITY_FOCUSED">Quantity Focused (Exact MOQ)</option>
            </select>
          </div>
        </div>

        {/* Vendor Offer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {vendorOffers.map((offer) => {
            const fit = dealFitScores[offer.vendorId] || {
              overallScore: 85,
              priceScore: 80,
              quantityFitScore: 85,
              deliverySpeedScore: 90,
              reliabilityScore: 95,
              executiveRationale: 'Standard quotation',
              tradeOffSummary: 'Balanced fit',
            };

            const isTopFit = topFitOffer?.vendorId === offer.vendorId;

            return (
              <div
                key={offer.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isTopFit
                    ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Vendor Name & Badges */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">{offer.vendorName}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400">Payment: {offer.paymentTerms}</span>
                    </div>

                    {isTopFit && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white shadow-xs">
                        Top Fit
                      </span>
                    )}
                  </div>

                  {/* Core Offer Metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Quoted Price</span>
                      <span className="font-black text-slate-900 text-base">₹{offer.unitPrice.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/unit</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Lead</span>
                      <span className="font-bold text-slate-800 text-base">{offer.deliveryDays}</span>
                      <span className="text-[10px] text-slate-400 ml-1">days</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Vendor MOQ</span>
                      <span className="font-semibold text-slate-700">{offer.moq} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Cost</span>
                      <span className="font-semibold text-slate-700">₹{offer.totalCost.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Deal Fit Score Gauge */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">Deal Fit Score</span>
                      <span
                        className={`font-black text-sm ${
                          fit.overallScore >= 90
                            ? 'text-emerald-700'
                            : fit.overallScore >= 80
                            ? 'text-teal-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {fit.overallScore}/100
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fit.overallScore >= 90
                            ? 'bg-emerald-500'
                            : fit.overallScore >= 80
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${fit.overallScore}%` }}
                      />
                    </div>

                    {/* Subscore Breakdown Chips */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-1 text-slate-500">
                      <div className="bg-slate-100 rounded p-0.5">Price:{fit.priceScore}</div>
                      <div className="bg-slate-100 rounded p-0.5">Qty:{fit.quantityFitScore}</div>
                      <div className="bg-slate-100 rounded p-0.5">Speed:{fit.deliverySpeedScore}</div>
                      <div className="bg-slate-100 rounded p-0.5">Rel:{fit.reliabilityScore}</div>
                    </div>
                  </div>

                  {/* Executive Rationale */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-800">Trade-Off Analysis: </strong>
                    {fit.tradeOffSummary}
                  </div>
                </div>

                {/* Negotiation Action Button */}
                <button
                  onClick={() => handleInitiateNegotiation(offer.vendorId)}
                  className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isTopFit
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Negotiate with {offer.vendorName.split(' ')[0]}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
