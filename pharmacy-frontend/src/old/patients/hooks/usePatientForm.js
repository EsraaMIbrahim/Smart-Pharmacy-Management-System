import { useState } from "react";

export function usePatientForm() {
  const initialState = {
    fullName: "",
    phoneNumber: "",
    email: "",
  };

  const [form, setForm] = useState(initialState);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };

  const reset = () => {
    setForm(initialState);
    setIsEditing(false);
  };

  const fillForm = (patient) => {
    setForm({
      fullName: patient.fullName || "",
      phoneNumber: patient.phoneNumber || "",
      email: patient.email || "",
    });
    setIsEditing(true);
  };

  return {
    form,
    isEditing,
    setIsEditing,
    handleChange,
    reset,
    fillForm,
  };
}
