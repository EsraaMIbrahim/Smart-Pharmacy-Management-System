import { useState } from "react";

export default function SupplierForm({
  form = {},

  handleChange = () => () => {},

  isEditing = false,

  onSubmit = () => {},

  onCancel = () => {},
}) {
  const [error, setError] = useState("");

  // ============================================
  // VALIDATE FORM
  // ============================================

  const validateForm = () => {
    if (!form.name?.trim()) {
      return "Company name is required";
    }

    if (!form.contactPerson?.trim()) {
      return "Contact person is required";
    }

    if (!form.phone?.trim()) {
      return "Phone number is required";
    }

    if (form.phone.length < 8) {
      return "Invalid phone number";
    }

    if (!form.email?.trim()) {
      return "Email is required";
    }

    if (!form.email.includes("@")) {
      return "Invalid email address";
    }

    if (!form.address?.trim()) {
      return "Address is required";
    }

    return null;
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================

  const handleFormSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setError("");

      await onSubmit();
    } catch (err) {
      setError("Failed to save supplier");

      console.error(err);
    }
  };

  return (
    <div className={`supplier-form ${isEditing ? "editing" : ""}`}>
      <h4>{isEditing ? "Edit Supplier Info" : "Register Supplier"}</h4>

      {/* ============================================
          ERROR MESSAGE
      ============================================ */}

      {error && <div className="form-error">{error}</div>}

      <div className="supplier-grid">
        {/* ============================================
            COMPANY NAME
        ============================================ */}

        <input
          placeholder="Company Name"
          value={form.name || ""}
          onChange={handleChange("name")}
        />

        {/* ============================================
            CONTACT PERSON
        ============================================ */}

        <input
          placeholder="Contact Person"
          value={form.contactPerson || ""}
          onChange={handleChange("contactPerson")}
        />

        {/* ============================================
            PHONE
        ============================================ */}

        <input
          placeholder="Phone"
          value={form.phone || ""}
          onChange={handleChange("phone")}
        />

        {/* ============================================
            EMAIL
        ============================================ */}

        <input
          placeholder="Email"
          value={form.email || ""}
          onChange={handleChange("email")}
        />

        {/* ============================================
            ADDRESS
        ============================================ */}

        <input
          placeholder="Address"
          value={form.address || ""}
          onChange={handleChange("address")}
          className="span-2"
        />
      </div>

      {/* ============================================
          ACTIONS
      ============================================ */}

      <div className="supplier-actions">
        <button onClick={handleFormSubmit}>
          {isEditing ? "Save Changes" : "Add Supplier"}
        </button>

        {isEditing && <button onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
