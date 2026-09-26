import React from 'react';
import {
  LayoutDashboard,
  Package,
  Cpu,
  Truck,
  MessageSquareCode,
  Scale,
  TrendingDown,
  UserCheck,
  FileSpreadsheet,
  SlidersHorizontal,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export type NavigationTab =
  | 'dashboard'
  | 'inventory'
  | 'restocking'
  | 'vendors'
  | 'negotiations'
  | 'deals'
  | 'savings'
  | 'approvals'
  | 'purchase_orders'
  | 'what_if';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { medicines, activeNegotiation, deals, purchaseOrders } = useProcurement();

  const lowStockCount = medicines.filter(
    (m) => m.status === 'LOW_STOCK' || m.status === 'CRITICAL'
  ).length;

  const pendingApprovalsCount = deals.filter((d) => d.approvalStatus === 'PENDING').length;
  const activeNegotiationCount = activeNegotiation && activeNegotiation.status === 'IN_PROGRESS' ? 1 : 0;

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as NavigationTab,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'restocking' as NavigationTab,
      label: 'Restocking',
      icon: Cpu,
      badge: 'Smart AI',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'vendors' as NavigationTab,
      label: 'Vendors',
      icon: Truck,
      badge: null,
    },
    {
      id: 'negotiations' as NavigationTab,
      label: 'Negotiations',
      icon: MessageSquareCode,
      badge: activeNegotiationCount > 0 ? 'Live' : null,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse',
    },
    {
      id: 'deals' as NavigationTab,
      label: 'Deals',
      icon: Scale,
      badge: deals.length > 0 ? `${deals.length}` : null,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'savings' as NavigationTab,
      label: 'Savings',
      icon: TrendingDown,
      badge: null,
    },
    {
      id: 'approvals' as NavigationTab,
      label: 'Approvals',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
    },
    {
      id: 'purchase_orders' as NavigationTab,
      label: 'Purchase Orders',
      icon: FileSpreadsheet,
      badge: `${purchaseOrders.length}`,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'what_if' as NavigationTab,
      label: 'What-If Simulator',
      icon: SlidersHorizontal,
      badge: 'Lab',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Navigation Section */}
      <div className="p-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Procurement Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-900/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Core Principle Callout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Core Procurement Principle</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Cheapest ≠ Best.</strong> The agent weighs stockout risk, MOQ capital lock, delivery urgency, and shelf-life expiration.
          </p>
        </div>
      </div>
    </aside>
  );
};
