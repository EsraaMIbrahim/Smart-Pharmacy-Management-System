export default function SearchInput({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search by Name or Category..."
      value={value}
      onChange={onChange}
      className="search"
    />
  );
}
