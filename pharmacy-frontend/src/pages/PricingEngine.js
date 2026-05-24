/**
 * PricingEngine - Smart Discounting Module
 * Calculates time-based markdown incentives for expiring medications.
 */

export const getSmartDiscount = (expiryDate) => {
    if (!expiryDate) return 0;

    const expiry = new Date(expiryDate);
    const today = new Date();

    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / msPerDay);

    if (daysUntilExpiry <= 0) return 0;   // Already expired (Should be handled by IsActive check)
    if (daysUntilExpiry <= 5) return 0.40;  // 40% Markdown (Last chance clearance)
    if (daysUntilExpiry <= 14) return 0.20; // 20% Markdown (Standard promotion)
    if (daysUntilExpiry <= 30) return 0.10; // 10% Markdown (Early inventory velocity incentive)

    return 0; // No financial loss risk yet (Full BasePrice applies)
};

export const calculateDiscountDetails = (basePrice, expiryDate) => {
    const factor = getSmartDiscount(expiryDate);

    // Ensure basePrice evaluates safely as a number even if it arrives as an API string token
    const numBasePrice = Number(basePrice || 0);

    const suggestedPrice = (numBasePrice * (1 - factor)).toFixed(2);
    const percentage = (factor * 100).toFixed(0);

    return {
        suggestedPrice: parseFloat(suggestedPrice),
        percentage: percentage,
        hasRisk: factor > 0
    };
};