import { useMemo, useState } from "react";

export function useCart() {
  // ============================================
  // STATE
  // ============================================

  const [cart, setCart] = useState([]);

  // ============================================
  // ADD TO CART
  // ============================================

  const addToCart = (medicine) => {
    const existingItem = cart.find((item) => item.id === medicine.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === medicine.id
            ? {
                ...item,
                quantity: item.quantity + 1,

                totalPrice: (item.quantity + 1) * item.price,
              }
            : item,
        ),
      );

      return;
    }

    setCart([
      ...cart,
      {
        ...medicine,

        cartId: Date.now(),

        quantity: 1,

        totalPrice: medicine.price,
      },
    ]);
  };

  // ============================================
  // REMOVE FROM CART
  // ============================================

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  // ============================================
  // CLEAR CART
  // ============================================

  const clearCart = () => {
    setCart([]);
  };

  // ============================================
  // TOTAL
  // ============================================

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  return {
    cart,
    total,
    addToCart,
    removeFromCart,
    clearCart,
  };
}
