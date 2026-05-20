import { useState } from "react";

export function usePatientForm(addPatient, updatePatient) {
  const initialState = {
    id: null,

    fullName: "",

    phoneNumber: "",

    email: "",

    totalSpent: 0,
  };

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
  // FILL FORM FOR EDITING
  // ============================================

  const fillForm = (patient) => {
    setForm({
      id: patient.id,

      fullName: patient.fullName || "",

      phoneNumber: patient.phoneNumber || "",

      email: patient.email || "",

      totalSpent: patient.totalSpent || 0,
    });

    setIsEditing(true);
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    if (!form.fullName || !form.phoneNumber) {
      alert("Please fill required fields.");

      return;
    }
    if (!form.email.includes("@")) {
      alert("Please enter valid email.");

      return;
    }

    if (isEditing) {
      await updatePatient(form.id, form);
    } else {
      const payload = {
        fullName: form.fullName,

        phoneNumber: form.phoneNumber,

        email: form.email,

        totalSpent: form.totalSpent,
      };

      await addPatient(payload);
    }

    reset();
  };

  return {
    form,

    isEditing,

    handleChange,

    handleSubmit,

    reset,

    fillForm,
  };
}
