import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Scale,
  Building2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';

interface ApprovalsPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ setActiveTab }) => {
  const {
    deals,
    approveDealAndWriteBackERP,
    rejectDeal,
    renegotiateDeal,
  } = useProcurement();

  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null);

  const pendingDeals = deals.filter((d) => d.approvalStatus === 'PENDING');
  const pastDeals = deals.filter((d) => d.approvalStatus !== 'PENDING');

  const handleApprove = (dealId: string) => {
    approveDealAndWriteBackERP(dealId);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleReject = (dealId: string) => {
    rejectDeal(dealId, 'Budget reallocation or catalog review requested.');
  };

  const handleRenegotiate = (dealId: string) => {
    renegotiateDeal(dealId);
    setActiveTab('negotiations');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Human-in-the-Loop Procurement Gate</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              {pendingDeals.length} Awaiting Authorization
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero autonomous financial commitments. Every negotiated batch requires Chief Pharmacist sign-off before PO generation.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('purchase_orders')}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>View Issued POs</span>
          <FileSpreadsheet className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-rose-600" />
          <span>Pending Chief Pharmacist Approvals</span>
        </h3>

        {pendingDeals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">All Procurement Requests Approved</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no pending restock orders awaiting review. Run a new AI procurement cycle or test negotiations to generate a restock deal.
            </p>
          </div>
        ) : (
          pendingDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl border-2 border-rose-200 p-6 shadow-md space-y-5"
            >
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    Action Required
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{deal.medicineName}</h3>
                  <p className="text-xs text-slate-500">
                    Negotiated with: <strong className="text-slate-800">{deal.vendorName}</strong> • Request ID: {deal.procurementRequestId}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Deal Fit Score</span>
                    <span className="text-xl font-black text-emerald-700">{deal.fitScore.overallScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Deal Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                  <span className="text-base font-bold text-slate-900">{deal.finalQuantity}</span>
                  <span className="text-[10px] text-slate-400 ml-1">units</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Negotiated Unit Price</span>
                  <span className="text-base font-bold text-emerald-700">₹{deal.finalUnitPrice.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 ml-1">(List: ₹{deal.originalUnitPrice})</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
                  <span className="text-base font-black text-slate-900">₹{deal.finalTotalCost.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Captured Savings</span>
                  <span className="text-base font-black text-emerald-700">₹{deal.totalSavings.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-600 ml-1">({deal.discountPercentage}%)</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Window</span>
                  <span className="text-base font-bold text-slate-900">{deal.deliveryDays}</span>
                  <span className="text-[10px] text-slate-400 ml-1">days guaranteed</span>
                </div>
              </div>

              {/* AI Recommendation & Rationale Box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Recommendation Rationale</span>
                </div>
                <p className="text-emerald-950 font-medium leading-relaxed">
                  {deal.aiExecutiveSummary ||
                    `Contract locks in a ₹${deal.totalSavings} reduction while guaranteeing a ${deal.deliveryDays}-day turnaround with ${deal.vendorName}. Expiry risk is ${deal.expiryRiskLevel}, preventing overstock while maintaining zero stockout exposure.`}
                </p>
              </div>

              {/* Crucial Action Buttons: APPROVE, REJECT, NEGOTIATE AGAIN */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleReject(deal.id)}
                  className="px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT</span>
                </button>

                <button
                  onClick={() => handleRenegotiate(deal.id)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  <span>NEGOTIATE AGAIN</span>
                </button>

                <button
                  onClick={() => handleApprove(deal.id)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>APPROVE & ISSUE PURCHASE ORDER</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Approved / Rejected Records */}
      {pastDeals.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Previous Approvals History
          </h3>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
            {pastDeals.map((deal) => (
              <div key={deal.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{deal.medicineName}</span>
                    <span className="text-slate-400">• {deal.vendorName}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {deal.finalQuantity} units @ ₹{deal.finalUnitPrice.toFixed(2)} | Saved ₹{deal.totalSavings.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{deal.approvalDate || deal.createdAt}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      deal.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {deal.approvalStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
