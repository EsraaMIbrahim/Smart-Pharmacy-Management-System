export default function InvoiceContent({ invoice }) {
  return (
    <div id="printable-invoice">
      <h2 className="invoice-title">Smart Pharmacy Receipt</h2>

      <p>
        <strong>Date:</strong> {invoice.date}
      </p>
      <p>
        <strong>Patient:</strong> {invoice.patient}
      </p>

      <hr />

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="center">Qty</th>
            <th className="right">Total</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i}>
              <td>{item.name}</td>
              <td className="center">{item.quantity}</td>
              <td className="right">{item.totalPrice} EGP</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="invoice-total">Total: {invoice.total} EGP</h3>

      <p className="invoice-footer">Thank you for choosing Smart Pharmacy!</p>
    </div>
  );
}
