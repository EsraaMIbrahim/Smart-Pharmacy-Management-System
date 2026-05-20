import SearchInput from "./SearchInput";
import AlternativesList from "./AlternativesList";
import { useAlternativeMatcher } from "./useAlternativeMatcher";
import "./alternatives.css";

export default function AlternativeMatcher({ findAlternatives }) {
  const { search, setSearch, alternatives, handleSearch } =
    useAlternativeMatcher(findAlternatives);

  return (
    <div className="alt-container no-print">
      <h2>Alternative Matcher</h2>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onSearch={handleSearch}
      />

      <AlternativesList items={alternatives} />
    </div>
  );
}
