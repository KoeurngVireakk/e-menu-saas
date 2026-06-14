import "datatables.net-dt/css/dataTables.dataTables.css";
import DataTablePlugin from "datatables.net-dt";
import { useEffect, useRef } from "react";
import { EmptyState, ErrorState, LoadingState } from "./ui";

export default function DataTable({ columns, rows = [], renderActions, loading = false, error = "", emptyMessage = "No records found." }) {
  const tableRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    if (loading || error || rows.length === 0 || !tableRef.current) {
      return undefined;
    }

    instanceRef.current = new DataTablePlugin(tableRef.current, {
      destroy: true,
      responsive: true,
      pageLength: 10,
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [loading, error, rows.length]);

  if (loading) {
    return <LoadingState message="Loading data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm">
      <table ref={tableRef} className="display w-full text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {renderActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
              ))}
              {renderActions ? <td>{renderActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
