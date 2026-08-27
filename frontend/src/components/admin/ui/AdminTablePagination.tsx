"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface AdminTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function AdminTablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50],
}: AdminTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const totalRows = table.getFilteredRowModel().rows.length;

  if (totalRows <= Math.min(...pageSizeOptions) && pageIndex === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 text-[11px] font-mono text-text-muted bg-[#0c0c0c]/80 select-none">
        <span>Total: {totalRows} {totalRows === 1 ? "record" : "records"}</span>
        <span>Page 1 of 1</span>
      </div>
    );
  }

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50 bg-[#0c0c0c]/80 text-xs text-text-secondary select-none">
      {/* Left: row range & total count */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-text-muted">
        <span>
          Showing <span className="text-text-primary font-medium">{totalRows > 0 ? startRow : 0}</span>–
          <span className="text-text-primary font-medium">{endRow}</span> of{" "}
          <span className="text-text-primary font-medium">{totalRows}</span>
        </span>

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 ml-2 border-l border-border/50 pl-3">
          <span>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-white/[0.04] border border-border/60 rounded px-1.5 py-0.5 text-[11px] font-mono text-text-primary focus:outline-none focus:border-primary/50 [&>option]:bg-[#111] cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: navigation buttons */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-mono text-text-muted mr-2">
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>

        <button
          type="button"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-md border border-border/60 hover:bg-white/[0.06] hover:text-text-primary text-text-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={13} />
        </button>

        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1.5 rounded-md border border-border/60 hover:bg-white/[0.06] hover:text-text-primary text-text-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft size={13} />
        </button>

        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-md border border-border/60 hover:bg-white/[0.06] hover:text-text-primary text-text-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight size={13} />
        </button>

        <button
          type="button"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          className="p-1.5 rounded-md border border-border/60 hover:bg-white/[0.06] hover:text-text-primary text-text-secondary disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}

export default AdminTablePagination;
