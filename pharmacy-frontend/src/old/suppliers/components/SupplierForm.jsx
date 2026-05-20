export default function SupplierForm({
  form,
  handleChange,
  isEditing,
  onSubmit,
  onCancel,
}) {
  return (
    <div className={`supplier-form ${isEditing ? "editing" : ""}`}>
      <h4>{isEditing ? "📝 Edit Supplier Info" : "➕ Register Supplier"}</h4>

      <div className="supplier-grid">
        <input
          placeholder="Company Name"
          value={form.name || ""}
          onChange={handleChange("name")}
        />
        <input
          placeholder="Contact Person"
          value={form.contactPerson || ""}
          onChange={handleChange("contactPerson")}
        />
        <input
          placeholder="Phone"
          value={form.phone || ""}
          onChange={handleChange("phone")}
        />

        <input
          placeholder="Email"
          value={form.email || ""}
          onChange={handleChange("email")}
        />

        <input
          placeholder="Address"
          value={form.address || ""}
          onChange={handleChange("address")}
          className="span-2"
        />
      </div>

      <div className="supplier-actions">
        <button onClick={onSubmit}>
          {isEditing ? "Save Changes" : "Add Supplier"}
        </button>

        {isEditing && <button onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
