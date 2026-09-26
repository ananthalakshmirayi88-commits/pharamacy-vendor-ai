import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  Scale,
  TrendingDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useProcurement } from '../context/ProcurementContext';

export const WhatIfPage: React.FC = () => {
  const { activeMedicine, vendors } = useProcurement();

  // Simulator Interactive States
  const [simulatedQty, setSimulatedQty] = useState<number>(60);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('VEND-01');
  const [simulatedPrice, setSimulatedPrice] = useState<number>(10.25);
  const [simulatedDeliveryDays, setSimulatedDeliveryDays] = useState<number>(1);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Dynamic calculations for the simulator
  const totalCost = +(simulatedQty * simulatedPrice).toFixed(2);
  const catalogTotal = +(simulatedQty * activeMedicine.unitPrice).toFixed(2);
  const potentialSavings = +(catalogTotal - totalCost).toFixed(2);
  const discountPct = +(
    ((activeMedicine.unitPrice - simulatedPrice) / activeMedicine.unitPrice) *
    100
  ).toFixed(1);

  // Expiry risk calculation based on projected demand velocity
  const daysOfInventory = (activeMedicine.currentStock + simulatedQty) / Math.max(1, activeMedicine.dailySales);
  let expiryRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let expiryRiskExplanation = 'Safe stock buffer. Demand absorbs batch well within shelf-life.';

  if (daysOfInventory > 45) {
    expiryRisk = 'HIGH';
    expiryRiskExplanation = `High risk! Ordering ${simulatedQty} units results in ${daysOfInventory.toFixed(
      0
    )} days of inventory, risking expiration and tied-up hospital capital.`;
  } else if (daysOfInventory > 25) {
    expiryRisk = 'MEDIUM';
    expiryRiskExplanation = `Moderate risk: ${daysOfInventory.toFixed(
      0
    )} days of supply. Acceptable only if clinical turnover remains constant.`;
  }

  // Stockout vulnerability
  const remainingDays = activeMedicine.currentStock / Math.max(1, activeMedicine.dailySales);
  const stockoutRisk = simulatedDeliveryDays > remainingDays;

  // Deal Fit Score in simulator
  let score = 90;
  if (simulatedPrice < activeMedicine.unitPrice) score += 5;
  if (simulatedDeliveryDays <= 1) score += 4;
  if (expiryRisk === 'MEDIUM') score -= 10;
  if (expiryRisk === 'HIGH') score -= 28;
  if (stockoutRisk) score -= 30;
  score = Math.max(15, Math.min(99, score));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">What-If Procurement Simulator</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
              Sensitivity & Risk Lab
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate parameter adjustments to observe immediate impact on total cost, Deal Fit Score, and expiry hazard.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Real-Time Impact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Parameters Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">Simulation Inputs ({activeMedicine.name})</h3>
          </div>

          {/* Input 1: Quantity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Order Quantity:</span>
              <span className="font-mono font-bold text-purple-700 text-sm">{simulatedQty} units</span>
            </div>
            <input
              type="range"
              min={20}
              max={250}
              step={10}
              value={simulatedQty}
              onChange={(e) => setSimulatedQty(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20 (Lean)</span>
              <span>100 (Standard)</span>
              <span>250 (Bulk Ceiling)</span>
            </div>
          </div>

          {/* Input 2: Select Vendor */}
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-700">Select Vendor Partner:</span>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Reliability: {v.reliability}%, Default Delivery: {v.avgDeliveryDays}d)
                </option>
              ))}
            </select>
          </div>

          {/* Input 3: Negotiated Unit Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Negotiated Unit Price:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                ₹{simulatedPrice.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={activeMedicine.unitPrice * 0.75}
              max={activeMedicine.unitPrice * 1.15}
              step={0.1}
              value={simulatedPrice}
              onChange={(e) => setSimulatedPrice(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹{(activeMedicine.unitPrice * 0.75).toFixed(2)} (Floor)</span>
              <span>₹{activeMedicine.unitPrice.toFixed(2)} (Catalog List)</span>
              <span>₹{(activeMedicine.unitPrice * 1.15).toFixed(2)} (Premium)</span>
            </div>
          </div>

          {/* Input 4: Delivery Lead Days */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Delivery Lead Time:</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {simulatedDeliveryDays} day(s)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={simulatedDeliveryDays}
              onChange={(e) => setSimulatedDeliveryDays(parseInt(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 day (Rush Air)</span>
              <span>3 days (Standard)</span>
              <span>7 days (Surface Freight)</span>
            </div>
          </div>
        </div>

        {/* Right: Calculated Simulation Outcomes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Simulation Analytics</h3>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  score >= 85
                    ? 'bg-emerald-100 text-emerald-800'
                    : score >= 70
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                Deal Fit Score: {score}/100
              </span>
            </div>

            {/* Calculated KPI Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
                <span className="text-xl font-black text-slate-900">₹{totalCost}</span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Net Savings</span>
                <span className="text-xl font-black text-emerald-700">₹{potentialSavings}</span>
                <span className="text-[10px] text-emerald-600 ml-1">({discountPct}%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Inventory Runway</span>
                <span className="text-lg font-bold text-slate-800">{daysOfInventory.toFixed(1)} days</span>
              </div>
              <div
                className={`p-3 rounded-xl border ${
                  expiryRisk === 'HIGH'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : expiryRisk === 'MEDIUM'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="text-[10px] uppercase font-bold block">Expiry Risk</span>
                <span className="text-lg font-black">{expiryRisk} RISK</span>
              </div>
            </div>

            {/* Simulated Case Study Insight */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1.5 text-purple-950">
              <div className="font-bold flex items-center gap-1.5 text-purple-900">
                <Scale className="w-3.5 h-3.5 text-purple-600" />
                <span>Simulation Analysis</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                {expiryRiskExplanation}
              </p>
              {stockoutRisk && (
                <div className="flex items-center gap-1 text-rose-700 font-bold pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Warning: {simulatedDeliveryDays}d lead time exceeds remaining {remainingDays.toFixed(1)}d stock! Stockout likely!</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            <strong>Key Takeaway: </strong>
            “If quantity increases from 60 to 100, unit cost decreases by ₹0.80 but expiry risk increases from LOW to MEDIUM.”
          </div>
        </div>
      </div>
    </div>
  );
};
