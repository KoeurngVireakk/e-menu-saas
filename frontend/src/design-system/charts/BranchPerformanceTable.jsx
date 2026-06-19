import { formatCurrency } from "../../utils/currency";

export default function BranchPerformanceTable({ rows = [], currency = "KHR" }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Branch</th>
            <th className="px-3 py-2">Sales</th>
            <th className="px-3 py-2">Orders</th>
            <th className="px-3 py-2">Average</th>
            <th className="px-3 py-2">Pending payments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.branch_id || row.branch_name} className="border-t border-slate-100">
              <td className="px-3 py-3 font-black text-slate-950">{row.branch_name}</td>
              <td className="px-3 py-3">{formatCurrency(row.sales, currency)}</td>
              <td className="px-3 py-3">{row.orders}</td>
              <td className="px-3 py-3">{formatCurrency(row.average_order_value, currency)}</td>
              <td className="px-3 py-3">{row.pending_payments}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <p className="p-4 text-sm font-semibold text-slate-500">No branch performance data for this period.</p> : null}
    </div>
  );
}
