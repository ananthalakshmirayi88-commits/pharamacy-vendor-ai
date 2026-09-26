import React from 'react';
import {
  Truck,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { NavigationTab } from '../components/Sidebar';

interface VendorsPageProps {
  setActiveTab: (tab: NavigationTab) => void;
}

export const VendorsPage: React.FC<VendorsPageProps> = ({ setActiveTab }) => {
  const { vendors, startNegotiationWithVendor, activeMedicine } = useProcurement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Pharmaceutical Supplier Network</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {vendors.length} Verified Distributors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Auditing on-time fulfillment rates, MOQ compliance, and pricing flexibility.
          </p>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Vendor Title & Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>
                  <span className="text-[11px] text-slate-500 block">{vendor.contactPerson}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                {vendor.badge}
              </span>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reliability</span>
                  <span className="text-base font-black text-emerald-700">{vendor.reliability}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">On-Time Rate</span>
                  <span className="text-base font-black text-slate-800">{vendor.onTimeDeliveryRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Delivery</span>
                  <span className="font-semibold text-slate-700">{vendor.avgDeliveryDays} day(s)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Default MOQ</span>
                  <span className="font-semibold text-slate-700">{vendor.defaultMoq} units</span>
                </div>
              </div>

              {/* Terms & Contact */}
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Terms:</span>
                  <span className="font-bold text-slate-700">{vendor.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Past Orders:</span>
                  <span className="font-bold text-slate-700">{vendor.totalOrdersCompleted} completed</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-slate-400 pt-1">
                  <span>{vendor.email}</span>
                </div>
              </div>
            </div>

            {/* Restock with Vendor Button */}
            <button
              onClick={() => {
                startNegotiationWithVendor(vendor.id, 'BALANCED');
                setActiveTab('negotiations');
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold text-slate-800 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Negotiate Restock ({activeMedicine.name.split(' ')[0]})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
