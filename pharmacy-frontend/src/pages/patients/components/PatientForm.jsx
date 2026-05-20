import { useState } from "react";

export default function PatientForm({
  form = {},

  handleChange,

  isEditing,

  onSubmit,

  onCancel,
}) {
  const [error, setError] = useState("");

  // ============================================
  // VALIDATE
  // ============================================

  const validateForm = () => {
    if (!form.fullName?.trim()) {
      return "Full name is required";
    }

    if (!form.phoneNumber?.trim()) {
      return "Phone number is required";
    }

    // SIMPLE PHONE VALIDATION

    if (form.phoneNumber.length < 8) {
      return "Invalid phone number";
    }

    if (!form.email?.trim()) {
      return "Email is required";
    }

    // SIMPLE EMAIL CHECK

    if (!form.email.includes("@")) {
      return "Invalid email address";
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
      setError("Failed to save patient");

      console.error(err);
    }
  };

  return (
    <div className={`patient-form ${isEditing ? "editing" : ""}`}>
      <h4>
        {isEditing ? "📝 Edit Patient Information" : "👥 Register New Patient"}
      </h4>

      {/* ============================================
          ERROR
      ============================================ */}

      {error && <div className="form-error">{error}</div>}

      <input
        placeholder="Full Name"
        value={form.fullName || ""}
        onChange={handleChange("fullName")}
      />

      <input
        placeholder="Phone"
        value={form.phoneNumber || ""}
        onChange={handleChange("phoneNumber")}
      />

      <input
        placeholder="Email"
        value={form.email || ""}
        onChange={handleChange("email")}
      />

      <button onClick={handleFormSubmit}>
        {isEditing ? "Save Changes" : "Register"}
      </button>

      {isEditing && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}
