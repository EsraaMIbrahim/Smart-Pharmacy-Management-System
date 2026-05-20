import { useState } from "react";

export function useBarcodeScanner(onScan) {
  const [barcode, setBarcode] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!barcode.trim()) return;

      onScan(barcode);
      setBarcode(""); // clear after scan
    }
  };

  return {
    barcode,
    setBarcode,
    handleKeyDown,
  };
}
