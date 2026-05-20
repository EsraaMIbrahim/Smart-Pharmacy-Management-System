import { useMemo } from "react";

export function useStats(
  medicines,
  salesCountMap,
  TRENDING_THRESHOLD,
  getSmartDiscount,
) {
  const totalItems = medicines.length;

  const totalUnits = useMemo(
    () =>
      medicines.reduce(
        (sum, m) => sum + (m.StockQuantity || m.stockQuantity || 0),
        0,
      ),
    [medicines],
  );

  const lowStockCount = useMemo(
    () =>
      medicines.filter((m) => (m.StockQuantity || m.stockQuantity) < 10).length,
    [medicines],
  );

  const expiringCount = useMemo(
    () =>
      medicines.filter(
        (m) => getSmartDiscount(m.ExpiryDate || m.expiryDate) > 0,
      ).length,
    [medicines],
  );

  const capitalAtRisk = useMemo(
    () =>
      medicines
        .filter(
          (m) =>
            getSmartDiscount(m.ExpiryDate || m.expiryDate) > 0 &&
            (m.Price || m.price) >= (m.BasePrice || m.basePrice),
        )
        .reduce(
          (sum, m) =>
            sum +
            Number(m.Price || m.price || 0) *
              (m.StockQuantity || m.stockQuantity || 0),
          0,
        )
        .toFixed(2),
    [medicines, getSmartDiscount],
  );

  const trendingCount = useMemo(
    () =>
      medicines.filter((m) => {
        const n = (m.name || m.Name || "").toLowerCase().trim();
        return salesCountMap[n] >= TRENDING_THRESHOLD;
      }).length,
    [medicines, salesCountMap, TRENDING_THRESHOLD],
  );

  const outOfStock = useMemo(
    () =>
      medicines.filter(
        (m) =>
          (m.StockQuantity ?? m.stockQuantity) === 0 &&
          (m.IsActive ?? m.isActive),
      ).length,
    [medicines],
  );

  return {
    totalItems,
    totalUnits,
    lowStockCount,
    expiringCount,
    capitalAtRisk,
    trendingCount,
    outOfStock,
  };
}
