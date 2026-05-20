// This file contains utility functions for normalizing medicine objects and arrays of medicines.
// The normalizeMedicine function takes a medicine object and ensures that all expected properties are present,
// providing default values for any missing properties. This helps to prevent errors and inconsistencies when working with medicine data throughout the application.
// The normalizeMedicines function applies the normalization process to an array of medicine objects
// ensuring that all medicines in the array are properly normalized before being used in the application.

// ============================================
// NORMALIZE MEDICINE OBJECT
// ============================================

export function normalizeMedicine(medicine) {
  return {
    id: medicine.id || 0,

    name: medicine.name || "Unknown",

    activeIngredient: medicine.activeIngredient || "N/A",

    category: medicine.category || "General",

    price: Number(medicine.price || 0),

    stockQuantity: Number(medicine.stockQuantity || 0),

    expiryDate: medicine.expiryDate || null,

    barcode: medicine.barcode || "",

    isDisabled: medicine.isDisabled || false,
  };
}

// ============================================
// NORMALIZE ARRAY
// ============================================

export function normalizeMedicines(medicines = []) {
  return medicines.map(normalizeMedicine);
}
s;
