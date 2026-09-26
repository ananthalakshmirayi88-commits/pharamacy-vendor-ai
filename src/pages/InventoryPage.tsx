import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { Medicine, StockStatus } from '../types';
import { NavigationTab } from '../components/Sidebar';

interface InventoryPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ setActiveTab }) => {
  const { medicines, selectMedicine, updateMedicineData } = useProcurement();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category));
    return ['ALL', ...Array.from(set)];
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [medicines, searchQuery, selectedCategory, selectedStatus]);

  const handleStartRestock = (medicineId: string) => {
    selectMedicine(medicineId);
    setActiveTab('restocking');
  };

  // Quick dispense simulation for demo
  const handleSimulateDispense = (medicine: Medicine) => {
    const newStock = Math.max(0, medicine.currentStock - medicine.dailySales);
    updateMedicineData(medicine.id, { currentStock: newStock });
  };

  // Helper for status badge
  const renderStatusBadge = (status?: StockStatus) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
            Critical Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Low Stock
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-600" />
            Expiring Soon
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Pharmacy ERP Inventory Ledger</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {medicines.length} SKUs Monitored
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamically recalculates safety margins, daily sales velocity, and shelf-life expiration on every transaction.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
            Current Filter: <strong>{filteredMedicines.length} items</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, generic, or SKU ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Layers className="w-3.5 h-3.5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NORMAL">Normal Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="CRITICAL">Critical Stock</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medicine & SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Reorder Lvl</th>
                <th className="py-3 px-3">Daily Sales</th>
                <th className="py-3 px-3">Lead Time</th>
                <th className="py-3 px-3">Unit Price</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Calculated Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((med) => {
                const isUnderReorder = med.currentStock <= med.reorderLevel;
                const daysRunway = +(med.currentStock / Math.max(1, med.dailySales)).toFixed(1);

                return (
                  <tr
                    key={med.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Medicine Name & Generic */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {med.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {med.genericName} • <span className="font-mono text-slate-500">{med.id}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {med.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-black text-sm ${
                            isUnderReorder ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {med.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-400">units</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {daysRunway}d runway
                      </div>
                    </td>

                    {/* Reorder Level */}
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {med.reorderLevel} units
                    </td>

                    {/* Daily Sales */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{med.dailySales}</span>
                      <span className="text-[10px] text-slate-400 ml-1">/day</span>
                    </td>

                    {/* Lead Time */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{med.leadTime}</span>
                      <span className="text-[10px] text-slate-400 ml-1">days</span>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{med.unitPrice.toFixed(2)}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <span
                        className={
                          med.status === 'EXPIRING_SOON' ? 'text-purple-700 font-bold' : 'text-slate-600'
                        }
                      >
                        {med.expiryDate}
                      </span>
                    </td>

                    {/* Dynamic Calculated Status */}
                    <td className="py-3 px-3">
                      {renderStatusBadge(med.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick dispense trigger to test low stock */}
                        <button
                          onClick={() => handleSimulateDispense(med)}
                          title="Simulate daily patient dispensing (-daily sales)"
                          className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Dispense -{med.dailySales}
                        </button>

                        {/* AI Restock Button */}
                        <button
                          onClick={() => handleStartRestock(med.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all ${
                            isUnderReorder
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Restock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
