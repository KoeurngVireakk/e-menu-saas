import "datatables.net-dt/css/dataTables.dataTables.css";
import DataTablePlugin from "datatables.net-dt";
import { useEffect, useRef } from "react";

export default function DataTable({ columns, rows = [], renderActions, loading = false, error = "", emptyMessage = "No records found." }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (loading || error || rows.length === 0 || !tableRef.current) {
      return undefined;
    }

    const instance = new DataTablePlugin(tableRef.current, { destroy: true });

    return () => instance.destroy();
  }, [loading, error, rows]);

  if (loading) {
    return <StatePanel message="Loading data..." />;
  }

  if (error) {
    return <StatePanel tone="error" message={error} />;
  }

  if (rows.length === 0) {
    return <StatePanel message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white p-3 text-left">
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

function StatePanel({ message, tone = "muted" }) {
  return (
    <div className={`rounded-md border bg-white p-6 text-sm ${tone === "error" ? "border-rose-200 text-rose-700" : "border-slate-200 text-slate-500"}`}>
      {message}
    </div>
  );
}
