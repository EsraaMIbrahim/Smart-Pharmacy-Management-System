// This file contains utility functions for handling and formatting dates in the pharmacy management system.
// These functions include formatting dates and times, calculating days until expiry, and checking if a medicine is expiring soon or already expired.
// By centralizing these date-related functions, we can maintain consistency in how dates are handled and displayed across different components

// ============================================
// FORMAT DATE
// ============================================

export function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString();
}

// ============================================
// FORMAT DATE + TIME
// ============================================

export function formatDateTime(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString();
}

// ============================================
// DAYS UNTIL EXPIRY
// ============================================

export function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();

  const expiry = new Date(expiryDate);

  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  return diffDays;
}

// ============================================
// CHECK IF EXPIRING SOON
// ============================================

export function isExpiringSoon(expiryDate, days = 30) {
  const diff = getDaysUntilExpiry(expiryDate);

  return diff <= days;
}

// ============================================
// CHECK IF EXPIRED
// ============================================

export function isExpired(expiryDate) {
  return getDaysUntilExpiry(expiryDate) < 0;
}
