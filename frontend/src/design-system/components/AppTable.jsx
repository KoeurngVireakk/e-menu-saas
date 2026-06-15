import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import AppEmptyState from "./AppEmptyState";
import AppSkeleton from "./AppSkeleton";

export default function AppTable({ columns, data = [], loading = false, emptyTitle = "No records found", emptyDescription = "Try changing filters or creating a new record.", rowActions }) {
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
  if (!data.length) return <AppEmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3">
                  <button type="button" className="font-black" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </button>
                </th>
              ))}
              {rowActions ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
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
