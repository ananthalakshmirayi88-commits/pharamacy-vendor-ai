import React from 'react';
import {
  Sparkles,
  RefreshCw,
  Activity,
  ShieldCheck,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const Header: React.FC = () => {
  const { runSmartProcurementDemo, demoRunning, resetAllData, medicines } = useProcurement();

  const lowStockCount = medicines.filter(
    (m) => m.status === 'LOW_STOCK' || m.status === 'CRITICAL'
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                PHARMACY <span className="text-emerald-600">ERP</span>
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                AI Restock Agent
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Apollo Care Central Pharmacy Hub • Terminal #04
            </p>
          </div>
        </div>

        {lowStockCount > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{lowStockCount} medicines require immediate replenishment</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Button */}
        <button
          onClick={resetAllData}
          title="Reset to default hackathon demo scenario"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* System Health Indicators */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-700">Gemini 3.8 Agent Online</span>
          <span className="text-slate-300">|</span>
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-slate-500">ERP Connected</span>
        </div>

        {/* Master AI Demo Execution Button */}
        <button
          onClick={() => runSmartProcurementDemo('MED-101')}
          disabled={demoRunning}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-lg transition-all duration-200 ${
            demoRunning
              ? 'bg-emerald-700 opacity-90 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${demoRunning ? 'animate-spin' : ''}`} />
          <span>{demoRunning ? 'AI Restocking Running...' : 'RUN SMART PROCUREMENT'}</span>
        </button>
      </div>
    </header>
  );
};
