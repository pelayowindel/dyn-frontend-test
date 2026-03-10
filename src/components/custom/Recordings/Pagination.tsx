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
  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

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
          disabled={loading}
        >
          <option value={15}>15</option>
          <option value={30}>30</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onFirstPage}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First page"
        >
          <ChevronsLeft size={20} />
        </button>

        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1 || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous page"
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
              disabled={page === "..." || currentPage === page || loading}
              className={`min-w-10 rounded-md border px-2 py-1 text-sm font-medium transition ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : page === "..."
                    ? "cursor-default border-gray-200 bg-gray-50"
                    : "hover:bg-gray-100"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              title={page === "..." ? "More pages" : `Go to page ${page}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next page"
        >
          <ChevronRight size={20} />
        </button>

        <button
          onClick={onLastPage}
          disabled={currentPage === totalPages || loading}
          className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last page"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = "Pagination";
export default Pagination;
