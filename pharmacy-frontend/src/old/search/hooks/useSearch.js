import { useState, useEffect } from "react";

export function useSearch(initialValue = "", delay = 300) {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(handler);
  }, [search, delay]);

  return {
    search,
    setSearch,
    debouncedSearch,
  };
}
