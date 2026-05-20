// This custom hook manages the state and logic for a search input with debouncing.
// It provides a clean interface for components to interact with the search state
// and the debounced search value without having to manage the individual states and logic directly in the component.

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
