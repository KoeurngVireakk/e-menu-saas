import "datatables.net-dt/css/dataTables.dataTables.css";
import $ from "jquery";
import DataTablePlugin from "datatables.net-dt";
import { useEffect, useRef } from "react";

DataTablePlugin(window, $);

export default function DataTable({ columns, rows, renderActions }) {
  const tableRef = useRef(null);

  useEffect(() => {
    const instance = $(tableRef.current).DataTable({ destroy: true });
    return () => instance.destroy();
  }, [rows]);

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
