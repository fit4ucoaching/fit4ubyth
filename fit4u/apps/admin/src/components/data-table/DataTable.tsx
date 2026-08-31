import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

import { cn } from "../ui/utils";

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder?: string;
  pageSize?: number;
  /** Rendu optionnel d'une barre d'actions en masse quand des lignes sont sélectionnées. */
  bulkActions?: (selectedRows: T[]) => React.ReactNode;
  selectedIds?: string[];
  getRowId?: (row: T) => string;
  onToggleRow?: (id: string) => void;
}

/**
 * Table de données générique du BackOffice (Volume 4 : "Tableaux, Filtres,
 * Recherche, Pagination, Actions en masse"). Construite sur TanStack Table
 * — headless, réutilisée par tous les modules admin (Utilisateurs, VIP,
 * Commandes, Support…) sans dupliquer la logique de tri/pagination/recherche.
 */
export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Rechercher…",
  pageSize = 20,
  bulkActions,
  selectedIds = [],
  getRowId,
  onToggleRow,
}: DataTableProps<T>): JSX.Element {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = getRowId ? data.filter((row) => selectedIds.includes(getRowId(row))) : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" size={16} />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={searchPlaceholder}
          />
        </div>
        {bulkActions && selectedRows.length > 0 ? bulkActions(selectedRows) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {onToggleRow ? <th className="w-10 px-3 py-2" /> : null}
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 text-left font-semibold text-textSecondary">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const rowId = getRowId?.(row.original);
              return (
                <tr key={row.id} className="border-t border-border hover:bg-surface">
                  {onToggleRow && rowId ? (
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rowId)}
                        onChange={() => onToggleRow(rowId)}
                        aria-label="Sélectionner la ligne"
                      />
                    </td>
                  ) : null}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 text-textPrimary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-textSecondary">
        <span>
          Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={cn("rounded-md border border-border p-1.5", !table.getCanPreviousPage() && "opacity-40")}
            aria-label="Page précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={cn("rounded-md border border-border p-1.5", !table.getCanNextPage() && "opacity-40")}
            aria-label="Page suivante"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
