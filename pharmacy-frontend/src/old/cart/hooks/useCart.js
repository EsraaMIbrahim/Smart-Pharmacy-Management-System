import { useMemo } from "react";

export function useCart(cart) {
  const total = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.totalPrice, 0);
  }, [cart]);

  return {
    total,
  };
}
