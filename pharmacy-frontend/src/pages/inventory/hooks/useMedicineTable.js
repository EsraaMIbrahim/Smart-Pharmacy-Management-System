// This hook calculates medicine status
// for inventory table display.

export function useMedicineTable(med, getSmartDiscount) {
  // ============================================
  // LOW STOCK
  // ============================================

  const isLow = med.stockQuantity < 10;

  // ============================================
  // EXPIRY CHECK
  // ============================================

  const expiryDate = new Date(med.expiryDate);

  const isExpiringSoon =
    expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
    expiryDate >= new Date();

  // ============================================
  // DISCOUNT
  // ============================================

  const discount = getSmartDiscount?.(med.expiryDate) || 0;

  return {
    isLow,
    isExpiringSoon,
    discount,
  };
}
