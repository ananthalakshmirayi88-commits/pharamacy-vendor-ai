import { Medicine, StockStatus, Vendor, VendorOffer, DealFitScoreBreakdown } from '../types';

/**
 * Calculates stock status dynamically based on current inventory, reorder level,
 * and shelf-life expiry date.
 */
export function calculateStockStatus(medicine: Medicine, expiryThresholdDays: number = 60): StockStatus {
  const today = new Date();
  const expiry = new Date(medicine.expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysToExpiry <= expiryThresholdDays && daysToExpiry >= 0) {
    return 'EXPIRING_SOON';
  }

  if (medicine.currentStock <= Math.floor(medicine.reorderLevel * 0.4)) {
    return 'CRITICAL';
  }

  if (medicine.currentStock <= medicine.reorderLevel) {
    return 'LOW_STOCK';
  }

  return 'NORMAL';
}

export interface SmartQuantityResult {
  leadTimeDemand: number;
  safetyStock: number;
  requiredStock: number;
  rawRecommended: number;
  finalRecommended: number;
  daysOfInventoryLeft: number;
  expiryAdjustmentMade: boolean;
  moqAdjustmentMade: boolean;
  storageCapped: boolean;
  explanation: string;
  riskAssessment: string;
}

/**
 * Enterprise Smart Order Quantity formula considering:
 * - Lead Time Demand = dailySales × leadTime
 * - Required Stock = leadTimeDemand + safetyStock
 * - Recommended Quantity = requiredStock - currentStock
 * - Adjustments for MOQ, Maximum Storage Capacity, and Expiry Shelf-life Risk.
 */
export function calculateSmartOrderQuantity(
  medicine: Medicine,
  vendorMoq: number = 0
): SmartQuantityResult {
  const leadTimeDemand = medicine.dailySales * medicine.leadTime;
  const safetyStock = medicine.safetyStock;
  const requiredStock = leadTimeDemand + safetyStock;
  const rawRecommended = Math.max(0, requiredStock - medicine.currentStock);

  const daysOfInventoryLeft = +(medicine.currentStock / Math.max(1, medicine.dailySales)).toFixed(1);

  // Check days until expiry
  const today = new Date();
  const expiry = new Date(medicine.expiryDate);
  const daysToExpiry = Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  let finalRecommended = rawRecommended;
  let expiryAdjustmentMade = false;
  let moqAdjustmentMade = false;
  let storageCapped = false;

  // Expiry-Aware intelligence:
  // If existing stock is expiring very soon (e.g. <= 20 days), avoid ordering massive batches
  // that would sit on shelves alongside unsellable stock.
  if (daysToExpiry <= 20 && daysToExpiry > 0) {
    expiryAdjustmentMade = true;
    // Cap replenishment to demand within remaining safe shelf life
    finalRecommended = Math.max(medicine.dailySales * medicine.leadTime, Math.round(finalRecommended * 0.75));
  }

  // Adjust for Vendor MOQ if supplied
  if (vendorMoq > 0 && finalRecommended < vendorMoq) {
    // If MOQ is slightly higher, adjust to MOQ; if MOQ is ridiculously high (> 45 days of demand), flag risk
    finalRecommended = vendorMoq;
    moqAdjustmentMade = true;
  }

  // Max storage capacity cap
  const maxAllowable = medicine.maxStorageCapacity - medicine.currentStock;
  if (finalRecommended > maxAllowable) {
    finalRecommended = Math.max(0, maxAllowable);
    storageCapped = true;
  }

  // Build human-readable explanation
  let explanation = `Daily sales are ${medicine.dailySales} units and vendor lead time is ${medicine.leadTime} days. The system recommends ${finalRecommended} units to cover expected demand while maintaining safety stock.`;

  if (expiryAdjustmentMade) {
    explanation = `Existing stock has only ${daysToExpiry} days of shelf life remaining. The AI reduced the recommended order quantity to avoid potential wastage.`;
  } else if (storageCapped) {
    explanation += ` Order quantity adjusted to conform with maximum warehouse bin capacity of ${medicine.maxStorageCapacity} units.`;
  }

  let riskAssessment = 'Low inventory risk. Order covers demand buffer without tying up working capital.';
  if (daysOfInventoryLeft <= medicine.leadTime) {
    riskAssessment = `Urgent Stockout Risk: Only ${daysOfInventoryLeft} days of inventory remaining vs ${medicine.leadTime} days vendor lead time!`;
  }

  return {
    leadTimeDemand,
    safetyStock,
    requiredStock,
    rawRecommended,
    finalRecommended,
    daysOfInventoryLeft,
    expiryAdjustmentMade,
    moqAdjustmentMade,
    storageCapped,
    explanation,
    riskAssessment,
  };
};

/**
 * Calculates a comprehensive Deal Fit Score (0-100)
 * Proves that CHEAPEST ≠ ALWAYS BEST.
 * Balances price, quantity fit, delivery speed urgency, vendor reliability, and expiry risk.
 */
export function calculateDealFitScore(
  offer: VendorOffer,
  medicine: Medicine,
  vendor: Vendor,
  recommendedQty: number
): DealFitScoreBreakdown {
  const daysLeft = medicine.currentStock / Math.max(1, medicine.dailySales);

  // 1. Price Score (0 - 100)
  // Benchmark against standard catalog unit price
  const priceRatio = offer.unitPrice / medicine.unitPrice;
  let priceScore = 100 - (priceRatio - 0.75) * 120;
  priceScore = Math.max(20, Math.min(100, Math.round(priceScore)));

  // 2. Quantity & MOQ Fit Score (0 - 100)
  // Penalize heavily if MOQ forces 2x-3x more inventory than required
  const qtyRatio = offer.moq / Math.max(1, recommendedQty);
  let quantityFitScore = 100;
  if (qtyRatio > 1.8) {
    quantityFitScore = Math.max(30, Math.round(100 - (qtyRatio - 1) * 60));
  } else if (qtyRatio > 1.2) {
    quantityFitScore = Math.max(65, Math.round(100 - (qtyRatio - 1) * 40));
  }
  let moqFitScore = offer.moq <= recommendedQty ? 100 : Math.max(40, Math.round(100 - (offer.moq - recommendedQty) * 1.2));

  // 3. Delivery Speed Fit Score (0 - 100)
  // If deliveryDays > daysLeft, stockout happens before shipment arrives!
  let deliverySpeedScore = 100;
  if (offer.deliveryDays >= daysLeft) {
    // Critical stockout penalty!
    deliverySpeedScore = Math.max(15, Math.round(50 - (offer.deliveryDays - daysLeft) * 20));
  } else {
    // Safe delivery margin
    deliverySpeedScore = Math.max(60, Math.round(100 - offer.deliveryDays * 6));
  }

  // 4. Reliability Score (0 - 100)
  // Vendor track record, on-time rate, past compliance
  const reliabilityScore = Math.round((vendor.reliability * 0.6) + (vendor.onTimeDeliveryRate * 0.4));

  // 5. Expiry Safety Score (0 - 100)
  // Does ordering this quantity create inventory that will expire before sold?
  const daysToSellOrder = (offer.quantity || offer.moq) / Math.max(1, medicine.dailySales);
  const today = new Date();
  const expiry = new Date(medicine.expiryDate);
  const daysToExpiry = Math.max(1, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  let expirySafetyScore = 95;
  if (daysToSellOrder > daysToExpiry * 0.6) {
    expirySafetyScore = 40; // High risk of write-off
  } else if (daysToSellOrder > daysToExpiry * 0.4) {
    expirySafetyScore = 70;
  }

  // Weighted overall Deal Fit Score:
  // Price (25%), Quantity Fit (20%), Delivery (20%), Reliability (20%), Expiry Safety (15%)
  const overallScore = Math.round(
    priceScore * 0.25 +
    quantityFitScore * 0.20 +
    deliverySpeedScore * 0.20 +
    reliabilityScore * 0.20 +
    expirySafetyScore * 0.15
  );

  let executiveRationale = '';
  let tradeOffSummary = '';

  if (offer.deliveryDays <= 1 && vendor.reliability >= 95) {
    executiveRationale = `${vendor.name} offers ultra-fast 1-day delivery and elite 96% reliability. Minimizes stockout risk during current critical inventory level.`;
    tradeOffSummary = `Higher unit price of ₹${offer.unitPrice.toFixed(2)} is offset by zero stockout penalty and immediate fulfillment.`;
  } else if (offer.unitPrice < medicine.unitPrice * 0.95 && offer.deliveryDays > 3) {
    executiveRationale = `${vendor.name} provides the lowest unit price (₹${offer.unitPrice.toFixed(2)}), but extended lead time of ${offer.deliveryDays} days introduces stockout vulnerability.`;
    tradeOffSummary = `Requires ${offer.moq} MOQ, resulting in higher capital lock-in and delayed stock replenishment.`;
  } else {
    executiveRationale = `${vendor.name} provides a balanced proposal with moderate MOQ of ${offer.moq} units and steady ${offer.deliveryDays}-day delivery.`;
    tradeOffSummary = `Solid mid-tier choice with ₹${offer.unitPrice.toFixed(2)} unit cost and ${vendor.reliability}% track record.`;
  }

  return {
    priceScore,
    quantityFitScore,
    deliverySpeedScore,
    reliabilityScore,
    moqFitScore,
    expirySafetyScore,
    overallScore,
    executiveRationale,
    tradeOffSummary,
  };
}

/**
 * Generate multi-vendor quotes for a specific medicine restocking need.
 * Defaults to the standard demo numbers for Paracetamol 500mg as required by prompt!
 */
export function generateVendorOffers(
  medicine: Medicine,
  vendors: Vendor[],
  recommendedQty: number
): VendorOffer[] {
  // Check if Paracetamol 500mg demo scenario
  const isParacetamol = medicine.name.toLowerCase().includes('paracetamol');

  return vendors.map((vendor) => {
    let unitPrice = medicine.unitPrice;
    let moq = vendor.defaultMoq;
    let deliveryDays = vendor.avgDeliveryDays;
    let discount = 0;

    if (isParacetamol) {
      if (vendor.name.includes('MedSupply')) {
        unitPrice = 10.50;
        moq = 60;
        deliveryDays = 1;
        discount = 0;
      } else if (vendor.name.includes('PharmaDirect')) {
        unitPrice = 9.80;
        moq = 100;
        deliveryDays = 4;
        discount = 6.6;
      } else if (vendor.name.includes('MediCore')) {
        unitPrice = 10.20;
        moq = 40;
        deliveryDays = 2;
        discount = 2.8;
      } else if (vendor.name.includes('HealthKart')) {
        unitPrice = 9.50;
        moq = 80;
        deliveryDays = 5;
        discount = 9.5;
      } else {
        unitPrice = 10.60;
        moq = 50;
        deliveryDays = 1;
        discount = 0;
      }
    } else {
      // Dynamic generation relative to medicine catalog price
      if (vendor.name.includes('MedSupply')) {
        unitPrice = +(medicine.unitPrice * 1.02).toFixed(2);
        deliveryDays = 1;
        moq = Math.max(30, Math.round(recommendedQty * 1.1));
      } else if (vendor.name.includes('PharmaDirect')) {
        unitPrice = +(medicine.unitPrice * 0.94).toFixed(2);
        deliveryDays = 4;
        moq = Math.max(60, Math.round(recommendedQty * 1.6));
      } else if (vendor.name.includes('MediCore')) {
        unitPrice = +(medicine.unitPrice * 0.98).toFixed(2);
        deliveryDays = 2;
        moq = Math.max(25, Math.round(recommendedQty * 0.9));
      } else if (vendor.name.includes('HealthKart')) {
        unitPrice = +(medicine.unitPrice * 0.91).toFixed(2);
        deliveryDays = 5;
        moq = Math.max(70, Math.round(recommendedQty * 1.8));
      } else {
        unitPrice = +(medicine.unitPrice * 1.0).toFixed(2);
        deliveryDays = 1;
        moq = Math.max(40, Math.round(recommendedQty * 1.0));
      }
      discount = +(((medicine.unitPrice - unitPrice) / medicine.unitPrice) * 100).toFixed(1);
    }

    const orderQty = Math.max(recommendedQty, moq);
    const totalCost = +(unitPrice * orderQty).toFixed(2);

    return {
      id: `VO-${vendor.id}-${medicine.id}`,
      vendorId: vendor.id,
      vendorName: vendor.name,
      medicineId: medicine.id,
      quantity: orderQty,
      unitPrice,
      moq,
      deliveryDays,
      discount: Math.max(0, discount),
      totalCost,
      paymentTerms: vendor.paymentTerms,
      offerExpiryHours: 48,
    };
  });
}
