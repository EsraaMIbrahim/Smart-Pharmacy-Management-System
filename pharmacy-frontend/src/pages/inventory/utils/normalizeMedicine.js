export function normalizeMedicine(m) {
  return {
    id: m.Id || m.id,
    name: m.Name || m.name || "Unknown",
    category: m.Category || m.category || "General",
    ingredient: m.activeIngredient || m.ActiveIngredient || "",
    price: Number(m.Price ?? m.price ?? 0),
    basePrice: Number(m.BasePrice ?? m.basePrice ?? 0),
    stock: m.StockQuantity ?? m.stockQuantity ?? 0,
    expiry: new Date(m.ExpiryDate || m.expiryDate),
    isActive:
      m.IsActive === true ||
      m.IsActive === 1 ||
      m.isActive === true ||
      m.isActive === 1,
  };
}
