import { useState } from "react";

export function useAlternativeMatcher(findAlternatives) {
  const [search, setSearch] = useState("");
  const [alternatives, setAlternatives] = useState([]);

  const handleSearch = async () => {
    if (!search) return;

    const result = await findAlternatives(search);
    setAlternatives(result);
  };

  return {
    search,
    setSearch,
    alternatives,
    handleSearch,
  };
}
