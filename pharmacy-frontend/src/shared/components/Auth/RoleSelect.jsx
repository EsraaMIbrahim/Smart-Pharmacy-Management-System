export default function RoleSelect({ value, onChange }) {
  return (
    <select
      className="auth-select"
      value={value || "Staff"}
      onChange={onChange}
    >
      <option value="Admin">🛡️ Admin</option>
      <option value="Pharmacist">💊 Pharmacist</option>
      <option value="Staff">👤 Staff</option>
      <option value="Client">🛒 Client (Public)</option>
    </select>
  );
}
