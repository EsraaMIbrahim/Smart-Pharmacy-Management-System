// This hook processes the list of medicines to return only those that are active and in stock
// which are the products that should be displayed in the store page.
// It uses the normalizeMedicine function to ensure that each medicine object has a consistent structure before filtering
// based on its active status and stock level.

import { normalizeMedicine } from "../../inventory/utils/normalizeMedicine";

export function useProducts(medicines) {
  return medicines
    .map(normalizeMedicine)
    .filter((m) => m.isActive && m.stock > 0);
}
