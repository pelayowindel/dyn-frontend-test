import { useCallback, useState, memo } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled: boolean;
}

const SearchBar = memo(({ onSearch, disabled }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = useCallback(() => {
    onSearch(searchInput);
  }, [searchInput, onSearch]);

  return (
    <div className="flex gap-2 mb-6">
      <input
        className="w-full px-3 py-2 border rounded-md"
        placeholder="Search title/agent/tags..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
      <button
        className="px-3 py-2 rounded-md border hover:bg-gray-50"
        onClick={handleSearch}
        disabled={disabled}
      >
        Search
      </button>
    </div>
  );
});

SearchBar.displayName = "SearchBar";
export default SearchBar;
