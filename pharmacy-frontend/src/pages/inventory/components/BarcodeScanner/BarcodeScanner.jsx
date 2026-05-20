import ScannerInput from "./ScannerInput";
import ScannerHint from "./ScannerHint";
import { useBarcodeScanner } from "./useBarcodeScanner";
import "./barcodeScanner.css";
export default function BarcodeScanner({ onScan }) {
  const { barcode, setBarcode, handleKeyDown } = useBarcodeScanner(onScan);

  return (
    <div className="barcode-container">
      <h3 className="barcode-title">Barcode Search</h3>

      <ScannerInput
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <ScannerHint />
    </div>
  );
}
