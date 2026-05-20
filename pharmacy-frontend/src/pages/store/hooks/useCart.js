// This custom hook manages the state and logic for the shopping cart in the store page.
// It provides functions to add and remove items from the cart, handle the checkout process,
// and manage delivery information. The hook maintains the current state of the cart,
// the checkout step, delivery details, and whether an order has been placed.

import { useState } from "react";

export function useCart() {
  const [cart, setCart] = useState([]);

  const [checkoutStep, setCheckoutStep] = useState("shop");

  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    city: "Cairo",
    method: "Cash",
  });

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const addToCart = (medicine) => {
    setCart((prev) => [
      ...prev,
      {
        cartId: Date.now(),
        ...medicine,
        quantity: 1,
        totalPrice: medicine.price,
      },
    ]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((x) => x.cartId !== id));
  };

  const handleCheckout = () => {
    setCart([]);
    setCheckoutStep("shop");
    setIsOrderPlaced(true);
  };
  return {
    cart,
    checkoutStep,
    setCheckoutStep,
    deliveryInfo,
    setDeliveryInfo,
    isOrderPlaced,
    setIsOrderPlaced,
    addToCart,
    removeFromCart,
    handleCheckout,
  };
}
