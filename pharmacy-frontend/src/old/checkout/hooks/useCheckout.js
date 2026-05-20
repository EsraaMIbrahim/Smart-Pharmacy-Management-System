import { useMemo } from "react";

export function useCheckout(cart) {
  const total = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.totalPrice, 0);
  }, [cart]);

  return { total };
}
