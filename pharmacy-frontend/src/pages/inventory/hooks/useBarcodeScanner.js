// This hook manages the state and logic for a barcode scanner input in the inventory page.
// It allows users to type a barcode, checks if it exists in the inventory, verifies stock availability
// and adds the medicine to the cart if valid. It also handles resetting the input after processing.

import { useState } from "react";

export function useBarcodeScanner({ medicines, addToCart }) {
  const [barcodeInput, setBarcodeInput] = useState("");

  const handleBarcodeKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const trimmedBarcode = barcodeInput.trim();

    if (!trimmedBarcode) return;

    // Find medicine by barcode
    const foundMedicine = medicines.find(
      (med) => med.barcode === trimmedBarcode,
    );

    if (!foundMedicine) {
      alert("❌ Barcode not found in inventory.");

      setBarcodeInput("");
      return;
    }

    // Check stock
    if (foundMedicine.stockQuantity <= 0) {
      alert("⚠️ This medicine is out of stock.");

      setBarcodeInput("");
      return;
    }

    // Add to cart
    addToCart(foundMedicine);

    // Reset scanner input
    setBarcodeInput("");
  };

  return {
    barcodeInput,
    setBarcodeInput,
    handleBarcodeKeyDown,
  };
}
