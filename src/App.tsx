import React, { useState } from 'react';
import { ProcurementProvider } from './context/ProcurementContext';
import { Header } from './components/Header';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { UspBanner } from './components/UspBanner';
import { DemoProgressModal } from './components/DemoProgressModal';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { RestockingPage } from './pages/RestockingPage';
import { VendorsPage } from './pages/VendorsPage';
import { NegotiationsPage } from './pages/NegotiationsPage';
import { DealsPage } from './pages/DealsPage';
import { SavingsPage } from './pages/SavingsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { WhatIfPage } from './pages/WhatIfPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  return (
    <ProcurementProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {/* Top Header */}
        <Header />

        {/* Mandatory Core USP Innovation Banner */}
        <UspBanner />

        {/* Main Work Area: Left Sidebar + Page View */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
            {activeTab === 'inventory' && <InventoryPage setActiveTab={setActiveTab} />}
            {activeTab === 'restocking' && <RestockingPage setActiveTab={setActiveTab} />}
            {activeTab === 'vendors' && <VendorsPage setActiveTab={setActiveTab} />}
            {activeTab === 'negotiations' && <NegotiationsPage setActiveTab={setActiveTab} />}
            {activeTab === 'deals' && <DealsPage setActiveTab={setActiveTab} />}
            {activeTab === 'savings' && <SavingsPage />}
            {activeTab === 'approvals' && <ApprovalsPage setActiveTab={setActiveTab} />}
            {activeTab === 'purchase_orders' && <PurchaseOrdersPage />}
            {activeTab === 'what_if' && <WhatIfPage />}
          </main>
        </div>

        {/* 15-Step Automated Demo Progress Modal */}
        <DemoProgressModal />
      </div>
    </ProcurementProvider>
  );
}
