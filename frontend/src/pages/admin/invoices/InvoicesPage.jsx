import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import ReceiptPreview from "../../../components/ReceiptPreview";
import StatusBadge from "../../../components/StatusBadge";
import InvoicePrint from "../../../components/print/InvoicePrint";
import { Button, Card, confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "../../../utils/currency";
import { canPrintReceipt } from "../../../utils/permissions";

export default function InvoicesPage() {
  const { user } = useAuth();
  const allowPrint = canPrintReceipt(user);
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [printPreview, setPrintPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");

    return api
      .get("/invoices")
      .then((response) => setInvoices(response.data.data.invoices))
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load invoices.")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const open = async (invoice) => {
    const response = await api.get(`/invoices/${invoice.id}`);
    setSelected(response.data.data.invoice);
    setPrintPreview(null);
  };

  const loadPrint = async (invoice) => {
    const response = await api.get(`/invoices/${invoice.id}/print`);
    setSelected(invoice);
    setPrintPreview(response.data.data.print);
  };

  const markPaid = async (invoice) => {
    if (!await confirmAction("Mark invoice paid?", `${invoice.invoice_number} will be marked as paid.`)) return;

    await api.put(`/invoices/${invoice.id}/mark-paid`);
    toastSuccess("Invoice marked paid.");
    setSelected(null);
    load();
  };

  const cancel = async (invoice) => {
    if (!await confirmAction("Cancel invoice?", `${invoice.invoice_number} will be cancelled.`)) return;

    await api.put(`/invoices/${invoice.id}/cancel`);
    toastSuccess("Invoice cancelled.");
    setSelected(null);
    load();
  };

  return (
    <div className="grid gap-6">
      <Card className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Billing</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">Review, print, cancel, and mark issued invoices as paid.</p>
      </Card>

      {selected ? (
        <Card className="grid gap-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{selected.invoice_number}</h2>
              <p className="text-sm text-slate-500">{selected.order?.order_number} · {formatCurrency(selected.grand_total, selected.currency_code)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowPrint ? <Button type="button" variant="secondary" onClick={() => loadPrint(selected)}>Print invoice</Button> : null}
              {printPreview ? <Button type="button" variant="dark" onClick={() => window.print()}>Print now</Button> : null}
              {selected.status !== "paid" ? <Button type="button" onClick={() => markPaid(selected)}>Mark paid</Button> : null}
              {selected.status !== "cancelled" ? <Button type="button" variant="danger" onClick={() => cancel(selected)}>Cancel</Button> : null}
              <Button type="button" variant="secondary" onClick={() => { setSelected(null); setPrintPreview(null); }}>Close</Button>
            </div>
          </div>
          {printPreview ? <InvoicePrint print={printPreview} /> : <ReceiptPreview invoice={selected} />}
        </Card>
      ) : null}

      <DataTable
        columns={[
          { key: "invoice_number", label: "Invoice" },
          { key: "order", label: "Order", render: (row) => row.order?.order_number },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name },
          { key: "grand_total", label: "Total", render: (row) => formatCurrency(row.grand_total, row.currency_code) },
          { key: "balance_due", label: "Balance", render: (row) => formatCurrency(row.balance_due, row.currency_code) },
          { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={invoices}
        loading={loading}
        error={loadError}
        emptyMessage="No invoices yet."
        renderActions={(invoice) => (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => open(invoice)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">View</button>
            {allowPrint ? <button type="button" onClick={() => loadPrint(invoice)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Reprint</button> : null}
            {invoice.status !== "paid" ? <button type="button" onClick={() => markPaid(invoice)} className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white">Mark paid</button> : null}
          </div>
        )}
      />
    </div>
  );
}
