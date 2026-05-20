import SearchInput from "./SearchInput";
import ActionButton from "./ActionButton";
import { useSearch } from "./useSearch";
import { useEffect } from "react";
import "./search.css";

export default function Search({ onSearchChange, handlePrint }) {
  const { search, setSearch, debouncedSearch } = useSearch();

  // Notify parent when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="search-section no-print">
      <h2>Search Medicines</h2>
      <div className="search-container">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ActionButton label="Print Report" onClick={handlePrint} />
      </div>
    </div>
  );
}
