import InvoiceContent from "./InvoiceContent";

export default function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <div className="invoice-overlay">
      <div className="invoice-container">
        <InvoiceContent invoice={invoice} />

        <div className="invoice-actions no-print">
          <button onClick={() => window.print()}>🖨️ Print</button>

          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
