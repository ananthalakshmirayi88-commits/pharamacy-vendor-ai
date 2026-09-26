import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight, ShieldCheck, Scale, AlertOctagon } from 'lucide-react';

export const UspBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white border-b border-emerald-800/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Core Innovation USP
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Strategic Pharmacy Procurement Intelligence
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5 line-clamp-1 md:line-clamp-none">
              “Our AI does not simply find the cheapest vendor. It first understands what the pharmacy actually needs, calculates the right quantity, negotiates according to business constraints, adapts when vendors reject proposals, evaluates the complete deal, calculates savings, and asks for human approval before generating the purchase order.”
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-emerald-300 hover:text-white flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span>{expanded ? 'Hide Rationale' : 'How It Works'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-emerald-800/30 bg-slate-950/80 px-6 py-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <AlertOctagon className="w-4 h-4" />
                <span>Cheapest ≠ Best</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                HealthKart is ₹9.50 (lowest price), but requires a 5-day lead time. When stock is at 18 units with 12 daily sales, waiting 5 days causes a 3.5-day catastrophic stockout!
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50">
              <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
                <Scale className="w-4 h-4" />
                <span>Demand & Expiry Aware</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                PharmaDirect offers ₹9.80 but demands a 100-unit MOQ. Buying 100 units ties up working capital and risks expiring before dispensing.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Bargaining & Fallback</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Gemini negotiates with MedSupply (₹10.50 list, 1d delivery) to bring the price down to ₹10.25, capturing savings while securing lightning fulfillment.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50">
              <div className="flex items-center gap-2 text-teal-400 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Human-in-the-Loop ERP</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                No automatic buying without sign-off. The Chief Pharmacist approves the deal, which generates a compliant Purchase Order and automatically increments ERP stock.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
