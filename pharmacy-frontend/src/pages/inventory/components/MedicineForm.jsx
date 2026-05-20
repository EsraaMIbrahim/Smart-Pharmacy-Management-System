import { useState } from "react";

import FormField from "./FormField";

import FormGrid from "./FormGrid";

import { useMedicineForm } from "../hooks/useMedicineForm";

import "../styles/form.css";

export default function MedicineForm({
  formData,
  setFormData,
  isEditing,
  addMedicine,
  updateMedicine,
}) {
  const { handleChange } = useMedicineForm(formData, setFormData);

  const [error, setError] = useState("");

  // ============================================
  // VALIDATE FORM
  // ============================================

  const validateForm = () => {
    if (!formData.name?.trim()) {
      return "Medicine name is required";
    }

    if (!formData.activeIngredient?.trim()) {
      return "Active ingredient is required";
    }

    if (!formData.price || formData.price <= 0) {
      return "Price must be greater than 0";
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      return "Base price must be greater than 0";
    }

    if (!formData.stockQuantity || formData.stockQuantity < 0) {
      return "Stock quantity is required";
    }

    if (!formData.expiryDate) {
      return "Expiry date is required";
    }

    if (!formData.category?.trim()) {
      return "Category is required";
    }

    return null;
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setError("");

      if (isEditing) {
        await updateMedicine();
      } else {
        await addMedicine();
      }
    } catch (err) {
      setError("Failed to save medicine");

      console.error(err);
    }
  };

  return (
    <div className="form-container no-print">
      <h2>{isEditing ? "Modify Medicine" : "Add New Medicine"}</h2>

      {/* ============================================
          ERROR MESSAGE
      ============================================ */}

      {error && <div className="form-error">{error}</div>}

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
          placeholder="Base Price"
          value={formData.basePrice}
          onChange={handleChange("basePrice", parseFloat)}
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
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange("category")}
        />

        <FormField
          type="text"
          placeholder="Barcode (Optional)"
          value={formData.barcode}
          onChange={handleChange("barcode")}
        />
      </FormGrid>

      <button
        className={`form-button ${isEditing ? "edit" : "add"}`}
        onClick={handleSubmit}
      >
        {isEditing ? "Save Changes" : "Add to Inventory"}
      </button>
    </div>
  );
}
