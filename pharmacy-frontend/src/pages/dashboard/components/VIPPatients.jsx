export default function VIPPatients({ items = [] }) {
  return (
    <div className="widget-card">
      <h3>👑 VIP Patients</h3>

      {!items.length ? (
        <p>No patient data available.</p>
      ) : (
        <ul className="widget-list">
          {items.map((patient) => (
            <li key={patient.id}>
              <span>{patient.fullName}</span>

              <strong>{patient.totalSpent.toLocaleString()} EGP</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
