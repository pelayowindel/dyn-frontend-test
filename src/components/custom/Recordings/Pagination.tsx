import { memo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  onGoToPage: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  pageSize,
  loading,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onGoToPage,
  onPageSizeChange,
}: PaginationProps) {
  const hasResults = totalPages > 0;

  const getPageNumbers = useCallback(() => {
    if (!hasResults) return [];

    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to ensure we have enough pages to show
      if (end - start < 2) {
        if (start === 2) {
          end = Math.min(totalPages - 1, start + 2);
        } else if (end === totalPages - 1) {
          start = Math.max(2, end - 2);
        }
      }

      // Add left ellipsis
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages, hasResults]);

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="page-size-select" className="text-sm font-medium">
          Page size:
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-2 border rounded-md"
          disabled={loading || !hasResults}
        >
          <option value={15}>15</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onFirstPage}
          disabled={!hasResults || currentPage === 1 || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={20} />
        </button>

        <button
          onClick={onPreviousPage}
          disabled={!hasResults || currentPage === 1 || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (typeof page === "number") {
                  onGoToPage(page);
                }
              }}
              disabled={
                !hasResults || page === "..." || currentPage === page || loading
              }
              className={`min-w-10 rounded-md border px-2 py-1 text-sm font-medium transition ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : page === "..."
                    ? "cursor-default border-gray-200 bg-gray-50"
                    : "hover:bg-gray-100"
              } ${loading || !hasResults ? "opacity-50 cursor-not-allowed" : ""}`}
              title={page === "..." ? "More pages" : `Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={onNextPage}
          disabled={!hasResults || currentPage === totalPages || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={onLastPage}
          disabled={!hasResults || currentPage === totalPages || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = "Pagination";
export default Pagination;
