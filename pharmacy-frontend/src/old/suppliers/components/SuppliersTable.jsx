import SupplierRow from "./SupplierRow";

export default function SuppliersTable(props) {
  return (
    <table className="suppliers-table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Contact</th>
          <th>Address</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {props.suppliers.map((s) => (
          <SupplierRow key={s.id} supplier={s} {...props} />
        ))}
      </tbody>
    </table>
  );
}
