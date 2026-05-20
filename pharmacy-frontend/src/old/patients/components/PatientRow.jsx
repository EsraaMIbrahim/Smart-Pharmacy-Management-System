export default function PatientRow({
  patient,
  onEdit,
  onDelete,
  onViewHistory,
  userRole,
}) {
  return (
    <tr>
      <td>{patient.id}</td>
      <td>{patient.fullName}</td>
      <td>{patient.phoneNumber}</td>

      <td>
        <button onClick={() => onViewHistory(patient)}>View History</button>

        <button onClick={() => onEdit(patient)}>Edit</button>

        {userRole === "Admin" && (
          <button onClick={() => onDelete(patient.id)}>Delete</button>
        )}
      </td>
    </tr>
  );
}
