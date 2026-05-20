export default function SupplierRow({ supplier, onEdit, onDelete, userRole }) {
  return (
    <tr>
      <td>
        <strong>{supplier.name}</strong>
        <br />
        👤 {supplier.contactPerson || "N/A"}
      </td>

      <td>
        📞 {supplier.phone}
        <br />
        📧 {supplier.email || "N/A"}
      </td>

      <td>📍 {supplier.address || "N/A"}</td>

      <td>
        {(userRole === "Admin" || userRole === "Pharmacist") && (
          <button onClick={() => onEdit(supplier)}>Edit</button>
        )}

        {userRole === "Admin" && (
          <button onClick={() => onDelete(supplier.id)}>Delete</button>
        )}
      </td>
    </tr>
  );
}
