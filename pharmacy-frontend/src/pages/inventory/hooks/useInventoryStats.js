// This hook calculates various statistics about the inventory of medicines, such as total items, total units in stock.
// low stock count, expiring soon count, out of stock count, and total inventory value.
// It uses the useMemo hook to optimize performance by memoizing the calculated values based on the medicines array.

import { useMemo } from "react";

export function useInventoryStats(medicines) {
  // ============================================
  // TOTAL DIFFERENT MEDICINES
  // ============================================

  const totalItems = useMemo(() => {
    return medicines.length;
  }, [medicines]);

  // ============================================
  // TOTAL UNITS IN STOCK
  // ============================================

  const totalUnits = useMemo(() => {
    return medicines.reduce((sum, med) => sum + (med.stockQuantity || 0), 0);
  }, [medicines]);

  // ============================================
  // LOW STOCK COUNT
  // ============================================

  const lowStockCount = useMemo(() => {
    return medicines.filter((med) => (med.stockQuantity || 0) <= 10).length;
  }, [medicines]);

  // ============================================
  // EXPIRING SOON COUNT
  // ============================================

  const expiringCount = useMemo(() => {
    const today = new Date();

    return medicines.filter((med) => {
      if (!med.expiryDate) return false;

      const expiry = new Date(med.expiryDate);

      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      return diffDays <= 30;
    }).length;
  }, [medicines]);

  // ============================================
  // OUT OF STOCK COUNT
  // ============================================

  const outOfStockCount = useMemo(() => {
    return medicines.filter((med) => (med.stockQuantity || 0) <= 0).length;
  }, [medicines]);

  // ============================================
  // TOTAL INVENTORY VALUE
  // ============================================

  const inventoryValue = useMemo(() => {
    return medicines.reduce(
      (sum, med) => sum + (med.price || 0) * (med.stockQuantity || 0),
      0,
    );
  }, [medicines]);

  return {
    totalItems,
    totalUnits,
    lowStockCount,
    expiringCount,
    outOfStockCount,
    inventoryValue,
  };
}
