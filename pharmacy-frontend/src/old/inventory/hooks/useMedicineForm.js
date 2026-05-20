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
