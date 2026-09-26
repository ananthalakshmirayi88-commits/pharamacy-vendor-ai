import React from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  MessageSquareCode,
  UserCheck,
  TrendingDown,
  FileSpreadsheet,
  Truck,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';

interface DashboardPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const {
    medicines,
    vendors,
    deals,
    purchaseOrders,
    selectMedicine,
    runSmartProcurementDemo,
    timeline,
  } = useProcurement();

  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(
    (m) => m.status === 'LOW_STOCK' || m.status === 'CRITICAL'
  );
  const criticalStockCount = medicines.filter((m) => m.status === 'CRITICAL').length;
  const expiringSoonCount = medicines.filter((m) => m.status === 'EXPIRING_SOON').length;
  const pendingApprovalsCount = deals.filter((d) => d.approvalStatus === 'PENDING').length;

  const totalSavings = deals
    .filter((d) => d.approvalStatus === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalSavings, 298.0); // includes historical baseline

  // Chart 1: Inventory Health Distribution
  const inventoryHealthData = [
    { name: 'Normal Stock', value: medicines.filter((m) => m.status === 'NORMAL').length, color: '#10b981' },
    { name: 'Low Stock', value: medicines.filter((m) => m.status === 'LOW_STOCK').length, color: '#f59e0b' },
    { name: 'Critical Stock', value: criticalStockCount, color: '#ef4444' },
    { name: 'Expiring Soon', value: expiringSoonCount, color: '#8b5cf6' },
  ];

  // Chart 2: Monthly Procurement Spending
  const monthlySpendingData = [
    { month: 'Apr', spend: 38400, baseline: 41200 },
    { month: 'May', spend: 42100, baseline: 45800 },
    { month: 'Jun', spend: 39500, baseline: 43100 },
    { month: 'Jul', spend: 45200, baseline: 49000 },
    { month: 'Aug', spend: 41800, baseline: 45500 },
    { month: 'Sep', spend: 48750, baseline: 52400 },
  ];

  // Chart 3: Negotiation Savings by Medicine
  const savingsByMedicineData = [
    { medicine: 'Paracetamol 500mg', list: 630, negotiated: 615, saved: 15 },
    { medicine: 'Amoxicillin 500mg', list: 3360, negotiated: 3216, saved: 144 },
    { medicine: 'Pantoprazole 40mg', list: 2660, negotiated: 2506, saved: 154 },
    { medicine: 'Cough Syrup 100ml', list: 2340, negotiated: 2227, saved: 113 },
    { medicine: 'Insulin Glargine', list: 4200, negotiated: 3950, saved: 250 },
  ];

  // Chart 4: Vendor Performance
  const vendorPerformanceData = vendors.map((v) => ({
    name: v.name.split(' ')[0],
    reliability: v.reliability,
    onTimeRate: v.onTimeDeliveryRate,
    leadDays: v.avgDeliveryDays * 15, // scaled for visual bar
  }));

  // Target sample restock alert medicine (Paracetamol 500mg)
  const paracetamol = medicines.find((m) => m.name.toLowerCase().includes('paracetamol')) || medicines[0];

  const handleStartRestock = (medicineId: string) => {
    selectMedicine(medicineId);
    setActiveTab('restocking');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Procurement Command Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Restock Cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time demand velocity analysis, dynamic vendor bargaining, and automated inventory sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('restocking')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <span>View Restock Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => runSmartProcurementDemo('MED-101')}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>RUN SMART PROCUREMENT</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Medicines */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Medicines</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalMedicines}</span>
            <span className="text-[11px] text-slate-400">18 catalog lines</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% SKU coverage
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900">{lowStockMedicines.length}</span>
            <span className="text-[11px] text-amber-700">need replenishment</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            {criticalStockCount} in critical buffer zone
          </p>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-purple-200/80 bg-purple-50/20 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800">Expiring Soon</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900">{expiringSoonCount}</span>
            <span className="text-[11px] text-purple-700">within 60 days</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            AI limits replenishment batches
          </p>
        </div>

        {/* Active Negotiations */}
        <div
          onClick={() => setActiveTab('negotiations')}
          className="bg-white p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/20 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800">AI Negotiations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <MessageSquareCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-900">Active</span>
            <span className="text-[11px] text-indigo-700">Gemini 3.8</span>
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Adaptive bargaining ready
          </p>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => setActiveTab('approvals')}
          className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Human Approval</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-900">{pendingApprovalsCount}</span>
            <span className="text-[11px] text-rose-700">awaiting review</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {pendingApprovalsCount > 0 ? 'Requires Chief Pharmacist sign-off' : 'All clear'}
          </p>
        </div>

        {/* Total Savings */}
        <div
          onClick={() => setActiveTab('savings')}
          className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Total Savings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-900">₹{totalSavings.toFixed(0)}</span>
            <span className="text-[11px] text-emerald-700">negotiated</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Avg 6.2% off catalog quotes
          </p>
        </div>

        {/* Purchase Orders */}
        <div
          onClick={() => setActiveTab('purchase_orders')}
          className="bg-white p-4 rounded-xl border border-teal-200/80 bg-teal-50/20 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800">Purchase Orders</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-teal-900">{purchaseOrders.length}</span>
            <span className="text-[11px] text-teal-700">issued</span>
          </div>
          <p className="text-[11px] text-teal-600 font-medium mt-1">
            100% ERP inventory write-back
          </p>
        </div>

        {/* Vendors */}
        <div
          onClick={() => setActiveTab('vendors')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Connected Vendors</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{vendors.length}</span>
            <span className="text-[11px] text-slate-400">bidding partners</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            MedSupply, PharmaDirect, etc.
          </p>
        </div>
      </div>

      {/* Featured "Smart Restocking Alert" as specifically mandated in Section 4 */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-extrabold tracking-wider uppercase rounded-full bg-rose-600 text-white shadow-xs">
                LOW STOCK ALERT
              </span>
              <span className="text-xs font-semibold text-amber-800">
                Automated Restocking Trigger Detected
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {paracetamol.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {paracetamol.genericName} • Category: {paracetamol.category}
              </p>
            </div>

            {/* Crucial Restock Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Stock</span>
                <span className="text-xl font-black text-rose-600">{paracetamol.currentStock}</span>
                <span className="text-[10px] text-slate-400 ml-1">units</span>
              </div>
              <div className="bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Reorder Level</span>
                <span className="text-xl font-bold text-slate-800">{paracetamol.reorderLevel}</span>
                <span className="text-[10px] text-slate-400 ml-1">units</span>
              </div>
              <div className="bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Sales</span>
                <span className="text-xl font-bold text-slate-800">{paracetamol.dailySales}</span>
                <span className="text-[10px] text-slate-400 ml-1">units/day</span>
              </div>
              <div className="bg-white/80 border border-amber-200 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Time</span>
                <span className="text-xl font-bold text-slate-800">{paracetamol.leadTime}</span>
                <span className="text-[10px] text-slate-400 ml-1">days</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 col-span-2 sm:col-span-1 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Recommended Order</span>
                <span className="text-xl font-black text-emerald-700">38</span>
                <span className="text-[10px] text-emerald-700 ml-1">units</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-white/70 border border-slate-200/80 p-2.5 rounded-lg">
              <span className="font-semibold text-slate-800">AI Demand Analysis: </span>
              Daily sales are 12 units and vendor lead time is 3 days. Lead Demand (36) + Safety Stock (20) - Current Stock (18) = <strong className="text-emerald-700">38 units</strong> recommended.
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => handleStartRestock(paracetamol.id)}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>START AI PROCUREMENT</span>
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Evaluates 4 vendor bids & initiates bargaining
            </p>
          </div>
        </div>
      </div>

      {/* 5 Rich Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Inventory Health Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Inventory Health Breakdown</h4>
              <p className="text-xs text-slate-500">Real-time status across 18 catalog SKUs</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Live Stock
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {inventoryHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Procurement Spending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Monthly Procurement Spending (₹)</h4>
              <p className="text-xs text-slate-500">Baseline Catalog Cost vs Negotiated Spend</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
              Savings: ~₹3,650/mo
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySpendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Without AI (Catalog)"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="spend"
                  name="With AI Restock Agent"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Negotiation Savings by Medicine */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Negotiation Savings by Medicine</h4>
              <p className="text-xs text-slate-500">Comparison of List Price vs Negotiated Price per Order</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
              Simulated Data
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsByMedicineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="medicine" type="category" width={110} stroke="#475569" fontSize={10} />
                <Tooltip formatter={(value: any) => `₹${value}`} />
                <Legend />
                <Bar dataKey="list" name="List Price Total (₹)" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="negotiated" name="Negotiated Total (₹)" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Vendor Performance Matrix */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Vendor Performance & Reliability</h4>
              <p className="text-xs text-slate-500">Reliability Score vs On-Time Delivery %</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              5 Vendors
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reliability" name="Reliability Score (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onTimeRate" name="On-Time Delivery (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Activity Timeline Preview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Autonomous Restocking Audit Trail</h4>
            <p className="text-xs text-slate-500">Live operational events logged by ERP procurement agent</p>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active Feed
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
          {timeline.slice(0, 5).map((evt) => (
            <div key={evt.id} className="py-2.5 flex items-start gap-3 text-xs">
              <span className="font-mono text-slate-400 shrink-0 text-[11px] pt-0.5">
                {evt.timestamp}
              </span>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{evt.title}</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
