export default function NavButton({ label, active, onClick, variant }) {
  return (
    <button
      className={`nav-button ${active ? "active" : ""} ${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
