import { useState } from "react";

export function useSupplierForm() {
  const initialState = {
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  };

  const [form, setForm] = useState(initialState);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const reset = () => {
    setForm(initialState);
    setIsEditing(false);
  };

  const fillForm = (supplier) => {
    setForm({
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });
    setIsEditing(true);
  };

  return {
    form,
    isEditing,
    handleChange,
    reset,
    fillForm,
  };
}
