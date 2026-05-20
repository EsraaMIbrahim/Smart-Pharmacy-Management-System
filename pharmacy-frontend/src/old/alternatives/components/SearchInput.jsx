export default function SearchInput({ value, onChange, onSearch }) {
  return (
    <div className="alt-search">
      <input
        placeholder="Enter Out-of-Stock Medicine"
        value={value}
        onChange={onChange}
        className="alt-input"
      />
      <button className="alt-button" onClick={onSearch}>
        Find Alternatives
      </button>
    </div>
  );
}
