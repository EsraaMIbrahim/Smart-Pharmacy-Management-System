export default function SupplyHistory({ history }) {
  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Medicine</th>
          <th>Supplier</th>
          <th>Qty</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {history.length ? (
          history.map((h) => (
            <tr key={h.id}>
              <td>
                {h.orderDate
                  ? new Date(h.orderDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>{h.medicineName}</td>
              <td>{h.supplierName}</td>
              <td>{h.quantityReceived}</td>
              <td>{h.costPrice} EGP</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No records</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
