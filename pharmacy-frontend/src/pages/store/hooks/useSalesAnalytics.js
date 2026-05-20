export function useSalesAnalytics(cart) {
  const salesCountMap = {};

  cart.forEach((item) => {
    const key = item.name?.toLowerCase().trim();

    salesCountMap[key] = (salesCountMap[key] || 0) + item.quantity;
  });

  const TRENDING_THRESHOLD = 3;

  return {
    salesCountMap,

    TRENDING_THRESHOLD,
  };
}
