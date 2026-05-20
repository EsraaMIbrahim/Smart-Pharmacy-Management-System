export default function PatientForm({
  form = {},
  handleChange,
  isEditing,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={`patient-form ${isEditing ? "editing" : ""}`}>
      <h4>
        {isEditing ? "📝 Edit Patient Information" : "👥 Register New Patient"}
      </h4>

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

      <button onClick={onSubmit}>
        {isEditing ? "Save Changes" : "Register"}
      </button>

      {isEditing && <button onClick={onCancel}>Cancel</button>}
    </div>
  );
}
