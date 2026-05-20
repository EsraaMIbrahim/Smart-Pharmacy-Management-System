import PatientRow from "./PatientRow";

export default function PatientsTable(props) {
  return (
    <table className="patients-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {props.patients.map((p) => (
          <PatientRow key={p.id} patient={p} {...props} />
        ))}
      </tbody>
    </table>
  );
}
