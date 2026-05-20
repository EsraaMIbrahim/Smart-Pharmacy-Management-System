export default function ScannerInput({ value, onChange, onKeyDown }) {
  return (
    <input
      type="text"
      placeholder="Type Barcode and press ENTER..."
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="barcode-input"
      autoFocus
    />
  );
}
