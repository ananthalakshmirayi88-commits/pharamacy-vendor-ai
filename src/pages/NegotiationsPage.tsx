import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowDownUp,
  Cpu,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';

interface NegotiationsPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const NegotiationsPage: React.FC<NegotiationsPageProps> = ({ setActiveTab }) => {
  const {
    activeNegotiation,
    advanceNegotiationTurn,
    sendManualCounterOffer,
    simulateRejectionAndFallback,
    activeMedicine,
    vendorOffers,
    startNegotiationWithVendor,
  } = useProcurement();

  const [manualPriceInput, setManualPriceInput] = useState<string>('');
  const [manualQtyInput, setManualQtyInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAdaptiveExplainer, setShowAdaptiveExplainer] = useState<boolean>(false);

  // If no negotiation active, allow initiating one with top vendor
  if (!activeNegotiation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-xl mx-auto space-y-4 my-10 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Active AI Negotiation Session</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Start an autonomous bargaining session for <strong>{activeMedicine.name}</strong> to let Gemini negotiate price concessions while safeguarding delivery SLAs.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {vendorOffers.map((offer) => (
            <button
              key={offer.id}
              onClick={() => startNegotiationWithVendor(offer.vendorId, 'BALANCED')}
              className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
            >
              Negotiate with {offer.vendorName} (₹{offer.unitPrice})
            </button>
          ))}
        </div>
      </div>
    );
  }

  const session = activeNegotiation;
  const currentGap = +(session.initialOffer.unitPrice - session.currentCounterPrice).toFixed(2);
  const potentialSavings = +(currentGap * session.requiredQuantity).toFixed(2);

  const handleNextAITurn = async () => {
    setIsProcessing(true);
    await advanceNegotiationTurn();
    setIsProcessing(false);
  };

  const handleManualCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(manualPriceInput);
    const qty = parseInt(manualQtyInput) || session.requiredQuantity;
    if (isNaN(price) || price <= 0) return;

    setIsProcessing(true);
    await sendManualCounterOffer(price, qty);
    setManualPriceInput('');
    setIsProcessing(false);
  };

  const handleRejectionSimulation = async () => {
    setIsProcessing(true);
    await simulateRejectionAndFallback();
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Session Context Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              Live Negotiation Session
            </span>
            <span className="text-xs text-slate-400 font-mono">#{session.id}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            {session.medicineName} • Restock Batch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Partner: <strong className="text-slate-800">{session.selectedVendorName}</strong> | Quoted: ₹{session.initialOffer.unitPrice}/unit | Required: {session.requiredQuantity} units | Lead: {session.initialOffer.deliveryDays}d
          </p>
        </div>

        {/* Status Chip & Quick Actions */}
        <div className="flex items-center gap-2">
          {session.status === 'ACCEPTED' ? (
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Review Deal for Approval</span>
            </button>
          ) : (
            <button
              onClick={handleRejectionSimulation}
              disabled={isProcessing}
              title="Demonstrates Section 15: Vendor rejection triggers automated fallback to next best vendor"
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Vendor Rejection & Fallback</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Interface: Left: Chat Interface, Right: Live AI Reasoning Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chat Dialogue (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">AI Procurement Agent vs {session.selectedVendorName}</h4>
                <p className="text-[11px] text-slate-400">Round #{session.currentTurn} • Autonomous multi-turn bargaining</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-100/70 text-emerald-800 font-bold text-[11px]">
                Strategy: {session.strategy}
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
            {session.messages.map((msg) => {
              const isAi = msg.sender === 'AI_AGENT';
              const isVendor = msg.sender === 'VENDOR';
              const isSystem = msg.sender === 'SYSTEM';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs text-slate-600 font-medium"
                  >
                    <span className="font-bold text-slate-800">{msg.senderName}: </span>
                    {msg.text}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAi ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                      isAi
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-xs space-y-1.5 shadow-xs ${
                      isAi
                        ? 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 font-semibold">
                      <span>{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    {msg.proposedPrice && (
                      <div
                        className={`text-[11px] font-mono px-2 py-0.5 rounded inline-block font-bold ${
                          isAi ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Proposed Unit Price: ₹{msg.proposedPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Action Footer */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3">
            {session.status === 'ACCEPTED' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Deal Finalized & Agreed at ₹{session.currentCounterPrice.toFixed(2)}/unit!</span>
                    <p className="text-[11px] text-emerald-700">Next step: Chief Pharmacist approval before ERP write-back.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                >
                  View in Approvals
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Advance AI Button */}
                <button
                  onClick={handleNextAITurn}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Agent Reasoning...' : 'Advance AI Counter-Offer'}</span>
                </button>

                {/* Manual User Input Bar */}
                <form onSubmit={handleManualCounter} className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    step="0.05"
                    placeholder="Or enter manual counter (₹)..."
                    value={manualPriceInput}
                    onChange={(e) => setManualPriceInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !manualPriceInput}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Reasoning Panel (Section 13) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">AI Negotiation Reasoning Panel</h3>
            </div>

            {/* Current Strategy & Status */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Strategy:</span>
                <span className="font-bold text-slate-800">{session.strategy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target Purchase Price:</span>
                <span className="font-bold text-emerald-700">₹{session.targetPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Current Vendor Price:</span>
                <span className="font-bold text-slate-800">₹{session.currentCounterPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Negotiation Room:</span>
                <span className="font-bold text-teal-700">₹{Math.max(0, session.currentCounterPrice - session.targetPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Order Quantity:</span>
                <span className="font-bold text-slate-800">{session.requiredQuantity} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery SLA:</span>
                <span className="font-bold text-slate-800">{session.initialOffer.deliveryDays} day(s)</span>
              </div>
            </div>

            {/* AI Activity State Indicator */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Bot className="w-3.5 h-3.5 text-emerald-600" />
                <span>Agent Activity Status</span>
              </div>
              <p className="text-emerald-950 font-medium">
                {session.currentActivityState}
              </p>
            </div>

            {/* Deep Clinical Rationale */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-800 block">Agent Tactical Reasoning</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {session.aiReasoning}
              </p>
            </div>

            {/* Section 16: Adaptive Negotiation Callout */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-purple-900 font-bold">
                <span>Adaptive Upsell Guard (Section 16)</span>
                <button
                  onClick={() => setShowAdaptiveExplainer(!showAdaptiveExplainer)}
                  className="text-[10px] text-purple-700 underline"
                >
                  {showAdaptiveExplainer ? 'Hide' : 'Explain'}
                </button>
              </div>
              {showAdaptiveExplainer && (
                <p className="text-purple-950 leading-relaxed text-[11px] pt-1 border-t border-purple-200">
                  “Although the vendor may offer a lower unit price for 100 units, the additional quantity exceeds projected demand and increases expiry risk. The agent recommends staying with the smaller quantity.”
                </p>
              )}
            </div>
          </div>

          {/* Potential Savings Box */}
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Projected Savings</span>
              <span className="text-lg font-black text-teal-900">₹{potentialSavings}</span>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-white/80 px-2 py-1 rounded border border-teal-200">
              {session.initialOffer.unitPrice > session.currentCounterPrice
                ? `${(((session.initialOffer.unitPrice - session.currentCounterPrice) / session.initialOffer.unitPrice) * 100).toFixed(1)}% off`
                : 'Baseline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
