export default function GuardInput({ placeholder, value, onChange }) {
  return (
    <input
      className="guard-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
