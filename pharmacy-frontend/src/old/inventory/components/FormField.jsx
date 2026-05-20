export default function FormField({
  type = "text",
  placeholder,
  value,
  onChange,
  highlight,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      className={`form-input ${highlight ? "highlight" : ""}`}
    />
  );
}
