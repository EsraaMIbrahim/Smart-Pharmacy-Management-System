// This file contains utility functions related to discounts in the pharmacy management system.
// The getSmartDiscount function calculates a discount percentage based on the expiry date of a medicine.
// It returns a discount of 50% if the medicine expires in 30 days or less, 30% if it expires in 60 days or less,
// and 15% if it expires in 90 days or less. If the medicine expires in more than 90 days, it returns a discount of 0%.

// ============================================
// SMART EXPIRY DISCOUNT
// ============================================

export function getSmartDiscount(expiryDate) {
  if (!expiryDate) return 0;

  const today = new Date();

  const expiry = new Date(expiryDate);

  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  // Expired
  if (diffDays < 0) {
    return 1;
  }

  // 50%
  if (diffDays <= 30) {
    return 0.5;
  }

  // 30%
  if (diffDays <= 60) {
    return 0.3;
  }

  // 15%
  if (diffDays <= 90) {
    return 0.15;
  }

  return 0;
}

// ============================================
// APPLY DISCOUNT
// ============================================

export function applyDiscount(price, discount) {
  const finalPrice = price * (1 - discount);

  return Number(finalPrice.toFixed(2));
}

// ============================================
// FORMAT DISCOUNT LABEL
// ============================================

export function getDiscountLabel(discount) {
  if (!discount) return "";

  return `${discount * 100}% OFF`;
}
