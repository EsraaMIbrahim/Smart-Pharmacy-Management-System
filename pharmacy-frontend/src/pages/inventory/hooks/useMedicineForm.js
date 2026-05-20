// This hook manages the state of the medicine form, providing a handleChange function to update form data based on user input.

export function useMedicineForm(formData, setFormData) {
  const handleChange = (field, parser) => (e) => {
    const value = parser ? parser(e.target.value) : e.target.value;

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return {
    handleChange,
  };
}
