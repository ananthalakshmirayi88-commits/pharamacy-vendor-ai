import React from 'react';
import {
  TrendingDown,
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Scale,
  Award,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useProcurement } from '../context/ProcurementContext';

export const SavingsPage: React.FC = () => {
  const { deals } = useProcurement();

  // Simulated savings benchmarks
  const withoutAiSpend = 52400;
  const withAiSpend = 48750;
  const totalSavings = withoutAiSpend - withAiSpend;
  const avgDiscountPercent = 6.96;

  // Chart data: Savings over time
  const savingsOverTime = [
    { month: 'Apr', withoutAi: 41200, withAi: 38400, saved: 2800 },
    { month: 'May', withoutAi: 45800, withAi: 42100, saved: 3700 },
    { month: 'Jun', withoutAi: 43100, withAi: 39500, saved: 3600 },
    { month: 'Jul', withoutAi: 49000, withAi: 45200, saved: 3800 },
    { month: 'Aug', withoutAi: 45500, withAi: 41800, saved: 3700 },
    { month: 'Sep (Current)', withoutAi: 52400, withAi: 48750, saved: 3650 },
  ];

  // Chart data: Savings by Vendor
  const savingsByVendor = [
    { vendor: 'MedSupply', savings: 1420, orders: 12 },
    { vendor: 'MediCore', savings: 980, orders: 8 },
    { vendor: 'PharmaDirect', savings: 750, orders: 5 },
    { vendor: 'HealthKart', savings: 500, orders: 4 },
  ];

  // Chart data: Savings by Medicine Category
  const savingsByCategory = [
    { category: 'Antibiotics', value: 1240, color: '#10b981' },
    { category: 'Gastrointestinal', value: 890, color: '#0d9488' },
    { category: 'Analgesics', value: 650, color: '#6366f1' },
    { category: 'Antidiabetic', value: 520, color: '#f59e0b' },
    { category: 'Respiratory', value: 350, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Procurement Savings & Fiscal Intelligence</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified Economic ROI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditing direct savings achieved through Gemini bargaining without violating safety stock constraints.
          </p>
        </div>

        <div className="text-xs text-slate-500 italic">
          * Clearly labeled simulated demo procurement data
        </div>
      </div>

      {/* Featured Primary Comparison Card (Mandatory Prompt Format) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/40">
        <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Monthly Procurement Efficiency Benchmark</h3>
              <p className="text-xs text-slate-300">Catalog List Baseline vs AI Bargained Restock Spend</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Sep 2026 Cycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Without AI */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              WITHOUT AI (Catalog Baseline)
            </span>
            <div className="text-3xl font-black text-slate-200 mt-2 font-mono">
              ₹{withoutAiSpend.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Full vendor list prices with standard terms</p>
          </div>

          {/* With AI */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
              WITH AI RESTOCK AGENT
            </span>
            <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">
              ₹{withAiSpend.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1">Multi-turn dynamic counter-offer pricing</p>
          </div>

          {/* Total Savings */}
          <div className="bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 border-2 border-emerald-400/50 rounded-xl p-5 shadow-lg">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">
              TOTAL PROCUREMENT SAVINGS
            </span>
            <div className="text-4xl font-black text-white mt-2 font-mono text-emerald-300">
              ₹{totalSavings.toLocaleString()}
            </div>
            <p className="text-xs font-bold text-emerald-200 mt-1">
              +{avgDiscountPercent}% Bottom-Line Margin Expansion
            </p>
          </div>
        </div>
      </div>

      {/* 3 Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Savings Over Time (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Procurement Savings Trajectory (6-Month Trend)</h4>
              <p className="text-xs text-slate-500">Cumulative margin preserved via intelligent counter-offers</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Avg ₹3,540 / month
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="withoutAi" name="Without AI (₹)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withAi" name="With AI Agent (₹)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Savings by Category (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Savings by Medicine Category</h4>
            <p className="text-xs text-slate-500">Therapeutic category distribution</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={savingsByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="category"
                  label={(entry: any) => entry.category}
                >
                  {savingsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Savings by Vendor Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Vendor Concession Analysis</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          {savingsByVendor.map((sv) => (
            <div key={sv.vendor} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-800 text-sm block">{sv.vendor}</span>
              <div className="mt-2 flex justify-between items-baseline">
                <span className="text-slate-500">Total Saved:</span>
                <span className="font-bold text-emerald-700 text-base">₹{sv.savings}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Completed Orders:</span>
                <span className="font-mono">{sv.orders} POs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
