export default function ActionButton({ label, onClick }) {
  return (
    <button className="search-button" onClick={onClick}>
      {label}
    </button>
  );
}
