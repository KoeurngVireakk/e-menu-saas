import { useEffect, useRef } from "react";
import { EmptyState, ErrorState, LoadingState } from "./ui";

export default function DataTable({ columns, rows = [], renderActions, loading = false, error = "", emptyMessage = "No records found.", ariaLabel = "Data table" }) {
  const tableRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    if (loading || error || rows.length === 0 || !tableRef.current) {
      return undefined;
    }

    Promise.all([
      import("datatables.net-dt"),
      import("datatables.net-dt/css/dataTables.dataTables.css"),
    ]).then(([dataTablesModule]) => {
      if (cancelled || !tableRef.current) {
        return;
      }

      const DataTablePlugin = dataTablesModule.default;
      instanceRef.current = new DataTablePlugin(tableRef.current, {
        destroy: true,
        responsive: true,
        pageLength: 10,
      });
    });

    return () => {
      cancelled = true;
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
    return <ErrorState title="Unable to load table data" message={error} />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="premium-surface max-w-full overflow-x-auto overscroll-x-contain rounded-3xl border bg-white p-3 text-left" tabIndex="0" role="region" aria-label={`${ariaLabel} scrollable region`}>
      <table ref={tableRef} className="display w-full text-sm" aria-label={ariaLabel}>
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
