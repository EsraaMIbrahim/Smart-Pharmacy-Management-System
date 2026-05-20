import MedicineRow from "./MedicineRow";

export default function MedicineTable({
  medicines,
  userRole,
  getSmartDiscount,
  addToCart,
  handleEditClick,
}) {
  return (
    <table className="med-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Name</th>
          <th>Ingredient</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Expiry</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {medicines.map((med) => (
          <MedicineRow
            key={med.id}
            rawMed={med}
            userRole={userRole}
            getSmartDiscount={getSmartDiscount}
            addToCart={addToCart}
            handleEditClick={handleEditClick}
          />
        ))}
      </tbody>
    </table>
  );
}
