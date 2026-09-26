import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  Eye,
  X,
  Truck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';
import { PurchaseOrder } from '../types';

export const PurchaseOrdersPage: React.FC = () => {
  const { purchaseOrders } = useProcurement();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Purchase Orders & ERP Sync</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              {purchaseOrders.length} Issued Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formal procurement records with automatic real-time ERP inventory write-back and compliance audit trail.
          </p>
        </div>
      </div>

      {/* PO List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Vendor</th>
                <th className="py-3.5 px-3">Medicine & Qty</th>
                <th className="py-3.5 px-3">Subtotal</th>
                <th className="py-3.5 px-3">GST (5%)</th>
                <th className="py-3.5 px-3">Grand Total</th>
                <th className="py-3.5 px-3">ERP Write-Back</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.poNumber} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {po.poNumber}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{po.date}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    {po.vendorInfo.name}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-900">{po.items[0]?.medicineName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {po.items[0]?.quantity} units @ ₹{po.items[0]?.unitPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-700">
                    ₹{po.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    ₹{po.taxAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3 font-black text-slate-900">
                    ₹{po.grandTotal.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ERP Synced
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {po.previousStock} → {po.newStock} units
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PO</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable PO Modal / Sheet */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
              <span className="text-xs font-mono font-bold text-slate-500">
                Official Enterprise Purchase Order Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PO / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="space-y-6 pt-4 text-slate-800">
              {/* Document Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedPO.pharmacyInfo.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    {selectedPO.pharmacyInfo.address}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono mt-1 space-y-0.5">
                    <p>Drug License: {selectedPO.pharmacyInfo.license}</p>
                    <p>GSTIN: {selectedPO.pharmacyInfo.gstin}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-sm border border-emerald-300">
                    PURCHASE ORDER
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="font-mono font-bold text-slate-900 text-base">{selectedPO.poNumber}</p>
                    <p className="text-slate-500">Issue Date: {selectedPO.date}</p>
                    <p className="text-slate-500">Delivery Due: {selectedPO.deliveryDate}</p>
                  </div>
                </div>
              </div>

              {/* Vendor & Shipping Grid */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                    Vendor Details
                  </h4>
                  <p className="font-bold text-slate-900 text-sm">{selectedPO.vendorInfo.name}</p>
                  <p className="text-slate-600 mt-0.5">{selectedPO.vendorInfo.contact}</p>
                  <p className="text-slate-500">{selectedPO.vendorInfo.address}</p>
                  <p className="font-mono text-slate-500 mt-1">GSTIN: {selectedPO.vendorInfo.gstin}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                    Procurement Terms & ERP Sync
                  </h4>
                  <p className="text-slate-700">Payment Terms: <strong>{selectedPO.paymentTerms}</strong></p>
                  <p className="text-slate-700 mt-1">
                    ERP Stock Update: <strong>+{selectedPO.items[0]?.quantity} units added</strong>
                  </p>
                  <p className="text-emerald-700 font-bold mt-1">
                    ✓ Verified write-back to Apollo Care Central Database
                  </p>
                </div>
              </div>

              {/* Items Line Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPO.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{item.medicineName}</p>
                          <p className="text-[11px] text-slate-400">{item.genericName}</p>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          {item.quantity} units
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-700 font-medium">
                          {item.discountPercent}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ₹{item.lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{selectedPO.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5.0%):</span>
                    <span className="font-bold">₹{selectedPO.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                    <span>Grand Total:</span>
                    <span>₹{selectedPO.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300"></div>
                  <p className="font-bold text-slate-800 mt-2">Authorized Chief Pharmacist</p>
                  <p className="text-[11px] text-slate-400">Electronic Sign-off Verified</p>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-300"></div>
                  <p className="font-bold text-slate-800 mt-2">Vendor Receiving Acknowledgment</p>
                  <p className="text-[11px] text-slate-400">{selectedPO.vendorInfo.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
