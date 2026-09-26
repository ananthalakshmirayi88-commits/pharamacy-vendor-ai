import React from 'react';
import {
  Scale,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';

interface DealsPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({ setActiveTab }) => {
  const { deals } = useProcurement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Finalized Deal Evaluations</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {deals.length} Evaluated Contracts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audited comparisons of initial vendor quotations versus finalized negotiated resting points.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('approvals')}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Go to Human Approvals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Deals Cards List */}
      <div className="space-y-4">
        {deals.map((deal) => {
          const isApproved = deal.approvalStatus === 'APPROVED';
          const isPending = deal.approvalStatus === 'PENDING';

          return (
            <div
              key={deal.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                    <Scale className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{deal.medicineName}</h3>
                      <span className="text-xs font-mono text-slate-400">ID: {deal.id}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Contractor: <strong className="text-slate-800">{deal.vendorName}</strong> • Date: {deal.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    Deal Fit: {deal.fitScore.overallScore}/100
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isPending
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {deal.approvalStatus}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison: Original vs Final */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Original Offer */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Initial Catalog Quote</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit Price:</span>
                      <span className="font-bold text-slate-800">₹{deal.originalUnitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantity:</span>
                      <span className="font-bold text-slate-800">{deal.originalQuantity} units</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1">
                      <span className="text-slate-500">Original Total:</span>
                      <span className="font-bold text-slate-900">₹{deal.originalTotalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Final Negotiated Deal */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Negotiated Outcome</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-900">Negotiated Price:</span>
                      <span className="font-bold text-emerald-700">₹{deal.finalUnitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-900">Quantity:</span>
                      <span className="font-bold text-emerald-900">{deal.finalQuantity} units</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200 pt-1">
                      <span className="text-emerald-900">Final Total:</span>
                      <span className="font-bold text-emerald-800">₹{deal.finalTotalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Net Savings & Terms */}
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">Economic Impact & SLA</span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-teal-900">Direct Savings:</span>
                      <span className="font-black text-teal-700">₹{deal.totalSavings.toFixed(2)} ({deal.discountPercentage}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-teal-900">Guaranteed Lead:</span>
                      <span className="font-bold text-slate-800">{deal.deliveryDays} day(s)</span>
                    </div>
                    <div className="flex justify-between border-t border-teal-200 pt-1">
                      <span className="text-teal-900">Expiry Risk:</span>
                      <span className="font-bold text-emerald-700">{deal.expiryRiskLevel} RISK</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rationale Quote */}
              {deal.aiExecutiveSummary && (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
                  <span className="font-bold text-slate-800">AI Procurement Assessment: </span>
                  {deal.aiExecutiveSummary}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
