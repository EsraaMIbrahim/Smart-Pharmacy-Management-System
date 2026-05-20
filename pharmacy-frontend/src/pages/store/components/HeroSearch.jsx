import { useSearch } from "../../../shared/components/Search/useSearch";
import { useEffect } from "react";
export default function HeroSearch({ onSearchChange }) {
  const { search, setSearch, debouncedSearch } = useSearch();

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      placeholder="🔍 Search for medicine name or category..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="hero-search"
    />
  );
}
