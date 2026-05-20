import FormField from "./FormField";
import FormGrid from "./FormGrid";
import { useMedicineForm } from "../hooks/useMedicineForm";

export default function MedicineForm({
  formData,
  setFormData,
  isEditing,
  addMedicine,
  updateMedicine,
}) {
  const { handleChange } = useMedicineForm(formData, setFormData);

  return (
    <div className="form-container no-print">
      <h3>{isEditing ? "📝 Modify Medicine" : "➕ Add New Inventory"}</h3>

      <FormGrid>
        <FormField
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange("name")}
        />

        <FormField
          type="text"
          placeholder="Ingredient"
          value={formData.activeIngredient}
          onChange={handleChange("activeIngredient")}
        />

        <FormField
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange("price", parseFloat)}
        />

        <FormField
          type="number"
          placeholder="Stock"
          value={formData.stockQuantity}
          onChange={handleChange("stockQuantity", parseInt)}
        />

        <FormField
          type="date"
          value={formData.expiryDate}
          onChange={handleChange("expiryDate")}
        />

        <FormField
          placeholder="Category"
          value={formData.category}
          onChange={handleChange("category")}
        />

        <FormField
          placeholder="Barcode (Optional)"
          value={formData.barcode}
          onChange={handleChange("barcode")}
          highlight
        />
      </FormGrid>

      <button
        className={`form-button ${isEditing ? "edit" : "add"}`}
        onClick={isEditing ? updateMedicine : addMedicine}
      >
        {isEditing ? "Save Changes" : "Add to Inventory"}
      </button>
    </div>
  );
}
