// This custom hook manages the state and logic for generating and managing invoices in the pharmacy management system.
// It provides a clean interface for components to interact with the current invoice state
// and the functions to generate and close invoices without having to manage the individual states and logic directly in the component.

import { useState } from "react";

export function useInvoice() {
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // ============================================
  // GENERATE INVOICE
  // ============================================

  const generateInvoice = ({ patient, cart }) => {
    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    const invoice = {
      id: Date.now(),

      date: new Date().toLocaleString(),

      patient: patient || "Walk-in Customer",

      items: cart,

      total,
    };

    setCurrentInvoice(invoice);

    return invoice;
  };

  // ============================================
  // CLOSE INVOICE
  // ============================================

  const closeInvoice = () => {
    setCurrentInvoice(null);
  };

  return {
    currentInvoice,
    setCurrentInvoice,

    generateInvoice,
    closeInvoice,
  };
}
