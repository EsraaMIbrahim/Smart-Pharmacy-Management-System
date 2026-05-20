export default function PatientHistory({ patient, history, onClose }) {
  if (!patient) return null;

  return (
    <div className="patient-history">
      <div className="history-header">
        <h3>📜 {patient.fullName}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Medicine</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {history.length ? (
            history.map((h) => (
              <tr key={h.id}>
                <td>{new Date(h.purchaseDate).toLocaleDateString()}</td>
                <td>{h.medicineName}</td>
                <td>{h.quantity}</td>
                <td>{h.totalPrice} EGP</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
