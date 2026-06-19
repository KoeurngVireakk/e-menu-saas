import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import AppEmptyState from "./AppEmptyState";
import AppSkeleton from "./AppSkeleton";

export default function AppTable({
  columns,
  data = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "Try changing filters or creating a new record.",
  emptyActionLabel,
  onEmptyAction,
  rowActions,
  ariaLabel = "Data table",
}) {
  const [sorting, setSorting] = useState([]);
  // TanStack Table intentionally returns instance functions; keep it isolated in this wrapper.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return <AppSkeleton variant="table" rows={5} />;
  if (!data.length) {
    return (
      <AppEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
        contained={false}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm" aria-label={ariaLabel}>
        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3"
                  aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none"}
                >
                  {header.column.getCanSort() ? (
                    <button type="button" className="rounded-lg font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" onClick={header.column.getToggleSortingHandler()}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </button>
                  ) : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
              {rowActions ? <th className="px-4 py-3"><span className="sr-only">Row actions</span></th> : null}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-slate-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              {rowActions ? <td className="px-4 py-3">{rowActions(row.original)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
