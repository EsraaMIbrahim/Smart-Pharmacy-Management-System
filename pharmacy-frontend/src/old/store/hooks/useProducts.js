import { normalizeMedicine } from "../../inventory/utils/normalizeMedicine";

export function useProducts(medicines) {
  return medicines
    .map(normalizeMedicine)
    .filter((m) => m.isActive && m.stock > 0);
}
