import { normalizeMedicine } from "../utils/normalizeMedicine";
import { useMedicineTable } from "../hooks/useMedicineTable";
import PriceCell from "./PriceCell";

export default function MedicineRow({
  rawMed,
  userRole,
  getSmartDiscount,
  addToCart,
  handleEditClick,
}) {
  const med = normalizeMedicine(rawMed);

  const { isLow, isExpiringSoon, discount } = useMedicineTable(
    med,
    getSmartDiscount,
  );

  return (
    <tr className={isLow ? "low-stock" : ""}>
      <td>{med.category}</td>
      <td>
        {med.name}
        {isLow && " 🚨"}
        {isExpiringSoon && " ⚠️"}
      </td>
      <td>{med.ingredient}</td>

      <td>
        <PriceCell med={med} discount={discount} userRole={userRole} />
      </td>

      <td>{med.stock}</td>
      <td>{med.expiry.toLocaleDateString()}</td>

      <td>
        <button className="edit-btn" onClick={() => addToCart(med)}>
          Add to Cart
        </button>
      </td>
    </tr>
  );
}
