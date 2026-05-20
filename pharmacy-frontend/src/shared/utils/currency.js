// This file contains utility functions for formatting currency values, specifically for Egyptian Pounds (EGP) and a compact format for large numbers.
// These functions use the built-in `Intl.NumberFormat` API to ensure proper localization and formatting of currency values throughout the application.
// By centralizing these formatting functions, we can maintain consistency in how currency values are displayed across different components
// and views in the pharmacy management system.

// ============================================
// FORMAT EGP CURRENCY
// ============================================

export function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",

    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================
// SHORT MONEY FORMAT
// ============================================

export function formatCompactCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
