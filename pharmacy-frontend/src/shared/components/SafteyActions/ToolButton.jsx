export default function ToolButton({ label, onClick, variant = "primary" }) {
  return (
    <button className={`tool-button ${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
