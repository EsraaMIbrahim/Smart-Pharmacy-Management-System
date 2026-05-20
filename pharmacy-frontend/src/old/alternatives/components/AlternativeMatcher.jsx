import SearchInput from "./SearchInput";
import AlternativesList from "./AlternativesList";
import { useAlternativeMatcher } from "../hooks/useAlternativeMatcher";

export default function AlternativeMatcher({ findAlternatives }) {
  const { search, setSearch, alternatives, handleSearch } =
    useAlternativeMatcher(findAlternatives);

  return (
    <div className="alt-container no-print">
      <h3>🔍 Alternative Matcher</h3>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={handleSearch}
      />

      <AlternativesList items={alternatives} />
    </div>
  );
}
