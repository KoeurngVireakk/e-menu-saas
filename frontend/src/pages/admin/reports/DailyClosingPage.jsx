import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import DailyClosingPrint from "../../../components/print/DailyClosingPrint";
import { Button, Card, ErrorState, Input, LoadingState, Select, StatCard, Textarea, alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "../../../utils/currency";

export default function DailyClosingPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", date: today() });
  const [countedCash, setCountedCash] = useState("");
  const [note, setNote] = useState("");
  const [closings, setClosings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState(null);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [selectedClosing, setSelectedClosing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.get("/shops").then((response) => {
      const loaded = response.data.data.shops;
      setShops(loaded);
      setFilters((current) => ({ ...current, shop_id: loaded[0]?.id || "" }));
    });
  }, []);

  useEffect(() => {
    if (!filters.shop_id) {
      return;
    }

    api.get(`/shops/${filters.shop_id}/branches`).then((response) => {
      const loaded = response.data.data.branches;
      setBranches(loaded);
      setFilters((current) => ({
        ...current,
        branch_id: user?.role === "cashier" ? loaded[0]?.id || "" : current.branch_id,
      }));
    });
  }, [filters.shop_id, user?.role]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);
  const currency = summary?.currency_code || selectedShop?.currency_code || "KHR";
  const expectedCash = payments?.methods?.cash?.paid_total || 0;
  const difference = countedCash === "" ? null : Number(countedCash || 0) - Number(expectedCash || 0);

  const load = useCallback(() => {
    if (!filters.shop_id || (user?.role === "cashier" && !filters.branch_id)) {
      return;
    }

    setLoading(true);
    setLoadError("");

    api.get("/reports/daily-closing", { params: cleanParams(filters) })
      .then((response) => {
        setClosings(response.data.data.closings);
        setSummary(response.data.data.summary);
        setPayments(response.data.data.payment_methods);
        setShiftSummary(response.data.data.shift_summary);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load daily closing.")))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const closeDay = async () => {
    try {
      const response = await api.post("/reports/daily-closing", {
        shop_id: filters.shop_id,
        branch_id: filters.branch_id || null,
        closing_date: filters.date,
        counted_cash_total: countedCash === "" ? null : countedCash,
        note,
      });
      const closing = response.data.data.daily_closing;
      setSelectedClosing(closing);
      setCountedCash("");
      setNote("");
      toastSuccess("Daily closing saved.");
      load();
    } catch (error) {
      alertError(error, "Unable to close the day.");
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 p-4 no-print">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {user?.role !== "cashier" ? <option value="">All branches</option> : null}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <Button type="button" onClick={load}>Refresh</Button>
          {selectedClosing ? <Button type="button" variant="secondary" onClick={() => window.print()}>Print closing</Button> : null}
        </div>
      </Card>

      {loading ? <LoadingState message="Loading closing data..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      {summary && !loading && !loadError ? (
        <>
          <div className="grid gap-4 md:grid-cols-3 no-print">
            <StatCard label="Expected cash" value={formatCurrency(expectedCash, currency)} tone="green" />
            <StatCard label="Net sales" value={formatCurrency(summary.net_sales, currency)} tone="blue" />
            <StatCard label="Open balance" value={formatCurrency(summary.unpaid_total, currency)} />
          </div>

          {shiftSummary?.open_shifts ? (
            <Card className="border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 no-print">
              {shiftSummary.open_shifts} open shift(s) must be closed before daily closing.
            </Card>
          ) : null}

          <Card className="grid gap-4 p-4 no-print">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Input label="Counted cash" type="number" min="0" step="0.01" value={countedCash} onChange={(event) => setCountedCash(event.target.value)} />
              <Input label="Cash difference" value={difference === null ? "" : formatCurrency(difference, currency)} readOnly />
              <Button type="button" className="self-end" onClick={closeDay}>Close day</Button>
            </div>
            <Textarea label="Note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
          </Card>

          <div className="no-print">
            <DataTable
              columns={[
                { key: "closing_date", label: "Date" },
                { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All branches" },
                { key: "expected_cash_total", label: "Expected", render: (row) => formatCurrency(row.expected_cash_total, row.currency_code) },
                { key: "counted_cash_total", label: "Counted", render: (row) => formatCurrency(row.counted_cash_total, row.currency_code) },
                { key: "cash_difference", label: "Diff", render: (row) => formatCurrency(row.cash_difference, row.currency_code) },
                { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              ]}
              rows={closings}
              emptyMessage="No closing records yet."
              renderActions={(closing) => (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSelectedClosing(closing)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Preview</button>
                  <button type="button" onClick={() => { setSelectedClosing(closing); window.setTimeout(() => window.print(), 0); }} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Print</button>
                </div>
              )}
            />
          </div>

          {selectedClosing ? <DailyClosingPrint closing={selectedClosing} /> : null}
        </>
      ) : null}
    </div>
  );
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
