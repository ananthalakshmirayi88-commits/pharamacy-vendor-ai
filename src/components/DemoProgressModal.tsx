import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const DemoProgressModal: React.FC = () => {
  const { demoRunning, demoCurrentStep, demoTotalSteps, demoStepMessage, stopDemo } =
    useProcurement();

  if (!demoRunning && demoCurrentStep === 0) return null;

  const percent = Math.min(100, Math.round((demoCurrentStep / demoTotalSteps) * 100));

  const stepsList = [
    'Select low-stock medicine',
    'Analyze inventory velocity',
    'Low stock & expiry detection',
    'Smart order quantity calculation',
    'Fetch multi-vendor catalog quotes',
    'Calculate Deal Fit Scores (Cheapest ≠ Best)',
    'Initiate AI bargaining negotiation',
    'Simulate AI counter-offer rounds',
    'Evaluate vendor pricing room',
    'Vendor accepts negotiated price',
    'Calculate net procurement savings',
    'Queue deal for Human Approval',
    'Chief Pharmacist signs off deal',
    'Generate compliant Purchase Order',
    'Execute ERP Inventory Write-Back (+60 units)',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">
                  Autonomous Restocking & Bargaining Demo
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-full uppercase tracking-wider">
                  Live Agent
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Executing 15-step end-to-end pharmacy ERP procurement cycle
              </p>
            </div>
          </div>
          <button
            onClick={stopDemo}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                Step {demoCurrentStep} of {demoTotalSteps}
              </span>
              <span>{percent}% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Current Action Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3.5">
            {demoRunning ? (
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                Current Agent Operation
              </h4>
              <p className="text-sm font-medium text-slate-800 leading-snug">
                {demoStepMessage || 'Preparing workflow execution...'}
              </p>
            </div>
          </div>

          {/* Steps Overview Mini-Timeline */}
          <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 text-xs">
            {stepsList.map((stepText, idx) => {
              const stepNumber = idx + 1;
              const isPast = stepNumber < demoCurrentStep;
              const isCurrent = stepNumber === demoCurrentStep;
              const isFuture = stepNumber > demoCurrentStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-emerald-100/70 border border-emerald-300 font-semibold text-emerald-900'
                      : isPast
                      ? 'text-slate-600'
                      : 'text-slate-400 opacity-60'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                      {stepNumber}
                    </div>
                  )}
                  <span className="truncate">{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Guaranteed Human-in-the-Loop ERP Write-Back</span>
          </div>
          <button
            onClick={stopDemo}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200/80 font-medium text-slate-700 transition-colors"
          >
            {demoRunning ? 'Stop Simulation' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
