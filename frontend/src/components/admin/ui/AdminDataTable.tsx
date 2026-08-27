"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  Search,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminTablePagination } from "./AdminTablePagination";
import { AdminEmptyState } from "./AdminEmptyState";

interface AdminDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  globalFilterFn?: (row: TData, filterValue: string) => boolean;
  filterControls?: React.ReactNode;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionIcon?: React.ReactNode;
  onEmptyAction?: () => void;
  enableSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  onBulkPublish?: (selectedRows: TData[]) => void;
  onBulkUnpublish?: (selectedRows: TData[]) => void;
  onBulkDelete?: (selectedRows: TData[]) => void;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  renderMobileCard?: (row: TData, table: any) => React.ReactNode;
  onRowClick?: (row: TData) => void;
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search records…",
  filterControls,
  actions,
  emptyState,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your criteria.",
  emptyActionLabel,
  emptyActionIcon,
  onEmptyAction,
  enableSelection = false,
  onRowSelectionChange,
  onBulkPublish,
  onBulkUnpublish,
  onBulkDelete,
  enableColumnVisibility = true,
  enablePagination = true,
  pageSize = 25,
  onRefresh,
  isRefreshing = false,
  className,
  renderMobileCard,
  onRowClick,
}: AdminDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const columnDropdownRef = useRef<HTMLDivElement>(null);

  // Table instance configuration
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Notify parent on row selection changes
  useEffect(() => {
    if (onRowSelectionChange && enableSelection) {
      const selected = table.getSelectedRowModel().rows.map((r) => r.original);
      onRowSelectionChange(selected);
    }
  }, [rowSelection, onRowSelectionChange, enableSelection, table]);

  // Click outside to close column visibility dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnDropdownRef.current &&
        !columnDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColumnDropdownOpen(false);
      }
    };
    if (isColumnDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColumnDropdownOpen]);

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const selectedCount = selectedRows.length;
  const filteredRows = table.getRowModel().rows;

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {/* ── Editorial Toolbar: Search, Filters, Columns, Density ─ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-[#0d0d0d] border border-white/[0.08] w-full min-w-0">
        {/* Left Side: Search & Optional Filter Selects */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Global Search Input (Pure Flex Container) */}
          <div className="flex items-center gap-2.5 h-9 px-3.5 w-full sm:w-auto sm:flex-1 sm:min-w-[220px] sm:max-w-xs bg-white/[0.02] border border-white/[0.08] rounded-lg focus-within:border-primary/50 focus-within:bg-white/[0.04] transition-colors">
            <Search
              size={13}
              className="text-text-muted shrink-0 pointer-events-none"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-xs font-body text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>

          {/* Custom Filter Selects and Refresh */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {filterControls}

            {/* Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 h-9 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <RefreshCw
                  size={13}
                  className={cn(isRefreshing && "animate-spin text-primary")}
                />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Density, Columns Toggle & Custom Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
          {/* Density Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-mono text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
            title={`Density: ${density === "comfortable" ? "Comfortable (Click for Compact)" : "Compact (Click for Comfortable)"}`}
          >
            <SlidersHorizontal size={12} />
            <span className="capitalize">{density}</span>
          </button>

          {/* Columns Visibility Dropdown */}
          {enableColumnVisibility && (
            <div className="relative shrink-0" ref={columnDropdownRef}>
              <button
                type="button"
                onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-xs font-body text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Toggle Columns"
              >
                <Columns size={13} />
                <span>Columns</span>
              </button>

              {isColumnDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#121212] border border-white/[0.12] shadow-2xl p-2 z-40 text-xs font-body">
                  <p className="px-2 py-1 text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Toggle Columns
                  </p>
                  <div className="h-px bg-white/[0.06] my-1" />
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {table
                      .getAllLeafColumns()
                      .filter((col) => col.getCanHide())
                      .map((column) => {
                        const isVisible = column.getIsVisible();
                        const headerValue = column.columnDef.header;
                        const label =
                          typeof headerValue === "string"
                            ? headerValue
                            : column.id;

                        return (
                          <button
                            key={column.id}
                            type="button"
                            onClick={() => column.toggleVisibility(!isVisible)}
                            className="w-full flex items-center justify-between px-2 py-1.5 rounded text-left text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors cursor-pointer"
                          >
                            <span className="capitalize">{label}</span>
                            {isVisible && (
                              <Check size={12} className="text-primary shrink-0" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action button (e.g. + New Item) */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* ── Floating Contextual Bulk Actions Bar ────────────────── */}
      {enableSelection && selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#141414] border border-primary/30 shadow-xl animate-in fade-in slide-in-from-top-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-text-primary">
              {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBulkPublish && (
              <button
                type="button"
                onClick={() => onBulkPublish(selectedRows)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-text-primary font-medium transition-colors cursor-pointer"
              >
                <Eye size={12} className="text-emerald-400" />
                <span>Publish</span>
              </button>
            )}

            {onBulkUnpublish && (
              <button
                type="button"
                onClick={() => onBulkUnpublish(selectedRows)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-text-secondary hover:text-text-primary font-medium transition-colors cursor-pointer"
              >
                <EyeOff size={12} className="text-text-muted" />
                <span>Unpublish</span>
              </button>
            )}

            {onBulkDelete && (
              <button
                type="button"
                onClick={() => onBulkDelete(selectedRows)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setRowSelection({})}
              className="text-[11px] font-mono text-text-muted hover:text-text-primary underline ml-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Table & Editorial Row Content ──────────────────────── */}
      {isLoading ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d0d] p-4 space-y-3 overflow-hidden">
          <div className="admin-skeleton h-8 rounded-lg w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="admin-skeleton h-12 rounded-lg w-full" />
            ))}
          </div>
        </div>
      ) : filteredRows.length === 0 ? (
        emptyState || (
          <AdminEmptyState
            title={emptyTitle}
            description={
              globalFilter
                ? `No records found matching "${globalFilter}".`
                : emptyDescription
            }
            actionLabel={
              globalFilter ? "Clear Search" : emptyActionLabel
            }
            actionIcon={emptyActionIcon}
            onAction={
              globalFilter ? () => setGlobalFilter("") : onEmptyAction
            }
          />
        )
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden">
          {/* Desktop & Tablet Table */}
          <div className={cn("overflow-x-auto", renderMobileCard ? "hidden md:block" : "block")}>
            <table className="w-full text-left text-xs">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-white/[0.08] bg-[#111111]/80 text-text-muted font-mono uppercase tracking-wider text-[10px]"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const isSorted = header.column.getIsSorted();

                      return (
                        <th
                          key={header.id}
                          className={cn(
                            header.id === "select" ? "w-10 px-3 text-center" : "px-4 font-medium select-none whitespace-nowrap",
                            density === "compact" ? "py-2.5" : "py-3.5",
                            canSort && "cursor-pointer hover:text-text-primary transition-colors"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className={cn("flex items-center gap-2", header.id === "select" && "justify-center")}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {canSort && (
                              <span className="shrink-0 text-text-muted opacity-70">
                                {isSorted === "asc" ? (
                                  <ArrowUp size={11} className="text-primary" />
                                ) : isSorted === "desc" ? (
                                  <ArrowDown size={11} className="text-primary" />
                                ) : (
                                  <ArrowUpDown size={11} />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>

              <tbody className="divide-y divide-white/[0.05] font-body">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "hover:bg-white/[0.025] transition-colors group relative",
                      row.getIsSelected() && "bg-primary/[0.04]",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          cell.column.id === "select" ? "w-10 px-3 text-center" : "px-4 align-middle",
                          density === "compact" ? "py-2.5" : "py-4"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          {renderMobileCard && (
            <div className="md:hidden divide-y divide-white/[0.05]">
              {table.getRowModel().rows.map((row) => (
                <div key={row.id} className="p-4 hover:bg-white/[0.025] transition-colors">
                  {renderMobileCard(row.original, table)}
                </div>
              ))}
            </div>
          )}

          {/* Table Pagination */}
          {enablePagination && <AdminTablePagination table={table} />}
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
