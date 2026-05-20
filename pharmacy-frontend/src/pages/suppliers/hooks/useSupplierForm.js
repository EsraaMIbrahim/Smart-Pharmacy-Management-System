import { useState } from "react";

export function useSupplierForm(addSupplier, updateSupplier) {
  // ============================================
  // INITIAL STATE
  // ============================================

  const initialState = {
    id: 0,

    name: "",

    contactPerson: "",

    phone: "",

    email: "",

    address: "",
  };

  // ============================================
  // STATE
  // ============================================

  const [form, setForm] = useState(initialState);

  const [isEditing, setIsEditing] = useState(false);

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================

  const handleChange = (field) => (e) => {
    setForm({
      ...form,

      [field]: e.target.value,
    });
  };

  // ============================================
  // RESET FORM
  // ============================================

  const reset = () => {
    setForm(initialState);

    setIsEditing(false);
  };

  // ============================================
  // FILL FORM
  // ============================================

  const fillForm = (supplier) => {
    setForm({
      id: supplier.id || 0,

      name: supplier.name || "",

      contactPerson: supplier.contactPerson || "",

      phone: supplier.phone || "",

      email: supplier.email || "",

      address: supplier.address || "",
    });

    setIsEditing(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Supplier name is required");

      return;
    }

    try {
      if (isEditing) {
        await updateSupplier(form.id, form);
      } else {
        const payload = {
          name: form.name,

          contactPerson: form.contactPerson,

          phone: form.phone,

          email: form.email,

          address: form.address,
        };

        await addSupplier(payload);
      }

      reset();
    } catch (error) {
      console.error("Supplier submit failed:", error);
    }
  };

  return {
    form,

    isEditing,

    handleChange,

    reset,

    fillForm,

    handleSubmit,
  };
}
