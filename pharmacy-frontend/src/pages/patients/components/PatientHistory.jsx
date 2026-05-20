export default function PatientHistory({ patient, history, onClose }) {
  if (!patient) return null;

  return (
    <div className="patient-history">
      <div className="history-header">
        <div>
          <h2>Patient History</h2>
          <h3>📜 {patient.fullName}</h3>
        </div>

        <button onClick={onClose}>Close</button>
      </div>

      {!history.length ? (
        <p>No orders found for this patient.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Medicine</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.orderDate).toLocaleDateString()}</td>

                <td>{item.medicineName}</td>

                <td>{item.quantity}</td>

                <td>{item.totalPrice} EGP</td>

                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
