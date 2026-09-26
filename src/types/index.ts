export type StockStatus = 'NORMAL' | 'LOW_STOCK' | 'CRITICAL' | 'EXPIRING_SOON';

export type NegotiationStrategy = 'PRICE_FOCUSED' | 'QUANTITY_FOCUSED' | 'DELIVERY_FOCUSED' | 'BALANCED';

export type NegotiationOutcome = 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'VENDOR_COUNTER' | 'SWITCHED_VENDOR';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  dailySales: number;
  leadTime: number; // in days
  safetyStock: number;
  expiryDate: string; // YYYY-MM-DD
  unitPrice: number; // in ₹
  maxStorageCapacity: number;
  supplier: string;
  batchNumber: string;
  packageType: string;
  status?: StockStatus;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  reliability: number; // percentage 0-100
  avgDeliveryDays: number;
  onTimeDeliveryRate: number; // percentage
  priceConsistencyScore: number; // 0-100
  defaultMoq: number;
  paymentTerms: string;
  totalOrdersCompleted: number;
  badge: string;
}

export interface VendorOffer {
  id: string;
  vendorId: string;
  vendorName: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  moq: number;
  deliveryDays: number;
  discount: number; // percentage
  totalCost: number;
  paymentTerms: string;
  offerExpiryHours: number;
  isInitialPreferred?: boolean;
}

export interface DealFitScoreBreakdown {
  priceScore: number; // 0-100
  quantityFitScore: number; // 0-100
  deliverySpeedScore: number; // 0-100
  reliabilityScore: number; // 0-100
  moqFitScore: number; // 0-100
  expirySafetyScore: number; // 0-100
  overallScore: number; // 0-100
  executiveRationale: string;
  tradeOffSummary: string;
}

export interface ChatMessage {
  id: string;
  sender: 'AI_AGENT' | 'VENDOR' | 'SYSTEM';
  senderName: string;
  text: string;
  timestamp: string;
  proposedPrice?: number;
  proposedQuantity?: number;
  isActionable?: boolean;
}

export interface NegotiationSession {
  id: string;
  procurementRequestId: string;
  medicineId: string;
  medicineName: string;
  requiredQuantity: number;
  targetPrice: number;
  maxAcceptablePrice: number;
  selectedVendorId: string;
  selectedVendorName: string;
  initialOffer: VendorOffer;
  currentCounterPrice: number;
  currentCounterQuantity: number;
  strategy: NegotiationStrategy;
  status: NegotiationOutcome;
  messages: ChatMessage[];
  currentTurn: number;
  rejectionCount: number;
  fallbackVendorTried?: boolean;
  aiReasoning: string;
  currentActivityState: string;
  startedAt: string;
  updatedAt: string;
}

export interface DealEvaluation {
  id: string;
  procurementRequestId: string;
  medicineId: string;
  medicineName: string;
  vendorId: string;
  vendorName: string;
  originalQuantity: number;
  finalQuantity: number;
  originalUnitPrice: number;
  finalUnitPrice: number;
  originalTotalCost: number;
  finalTotalCost: number;
  totalSavings: number;
  discountPercentage: number;
  deliveryDays: number;
  moq: number;
  fitScore: DealFitScoreBreakdown;
  expiryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  vendorReliability: number;
  approvalStatus: ApprovalStatus;
  approvalDate?: string;
  rejectionReason?: string;
  aiExecutiveSummary?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  poNumber: string;
  date: string;
  dealId: string;
  pharmacyInfo: {
    name: string;
    license: string;
    branch: string;
    address: string;
    gstin: string;
  };
  vendorInfo: {
    id: string;
    name: string;
    contact: string;
    email: string;
    address: string;
    gstin: string;
  };
  items: {
    medicineId: string;
    medicineName: string;
    genericName: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    taxPercent: number;
    lineTotal: number;
  }[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  deliveryDate: string;
  paymentTerms: string;
  status: 'PENDING_APPROVAL' | 'ISSUED' | 'ACKNOWLEDGED' | 'DELIVERED';
  erpSynced: boolean;
  erpSyncTimestamp?: string;
  previousStock: number;
  newStock: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  stage:
    | 'INVENTORY_ANALYSIS'
    | 'LOW_STOCK_DETECTED'
    | 'SMART_QUANTITY'
    | 'OFFERS_RECEIVED'
    | 'NEGOTIATION_STARTED'
    | 'COUNTER_OFFER'
    | 'VENDOR_REJECTED'
    | 'FALLBACK_VENDOR'
    | 'DEAL_FINALIZED'
    | 'PENDING_APPROVAL'
    | 'PO_GENERATED'
    | 'ERP_UPDATED';
  metadata?: Record<string, any>;
}
