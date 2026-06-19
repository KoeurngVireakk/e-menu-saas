import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import { Button, Card, ErrorState, Input, LoadingState, Select, StatCard, alertError } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { formatCurrency } from "../../../utils/currency";
import { canExportCashLedger } from "../../../utils/permissions";

export default function CashLedgerPage() {
  const { user } = useAuth();
  const allowExport = canExportCashLedger(user);
  const { data: shops = [] } = useShopsQuery();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", entry_type: "", direction: "", date: today() });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { data: branches = [] } = useBranchesQuery(filters.shop_id);

  useEffect(() => {
    if (shops.length && !filters.shop_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, shop_id: shops[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [filters.shop_id, shops]);

  useEffect(() => {
    if (branches.length && user?.role === "cashier" && !filters.branch_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, branch_id: branches[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [branches, filters.branch_id, user?.role]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);
  const currency = selectedShop?.currency_code || entries[0]?.currency_code || "KHR";

  const load = useCallback(() => {
    if (!filters.shop_id || (user?.role === "cashier" && !filters.branch_id)) return;

    setLoading(true);
    setLoadError("");
    api.get("/cash-ledger", { params: cleanParams(filters) })
      .then((response) => {
        setEntries(response.data.data.entries);
        setSummary(response.data.data.summary);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load cash ledger.")))
      .finally(() => setLoading(false));
  }, [filters, user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const exportCsv = async () => {
    try {
      const response = await api.get("/cash-ledger/export", {
        params: cleanParams(filters),
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `cash-ledger-${filters.date}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alertError(error, "Unable to export cash ledger.");
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {user?.role !== "cashier" ? <option value="">All branches</option> : null}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label="Type" value={filters.entry_type} onChange={(event) => setFilters({ ...filters, entry_type: event.target.value })}>
            <option value="">All</option>
            {["payment", "expense", "cash_in", "cash_out", "opening_float", "closing_difference", "refund", "adjustment"].map((type) => <option key={type} value={type}>{type}</option>)}
          </Select>
          <Select label="Direction" value={filters.direction} onChange={(event) => setFilters({ ...filters, direction: event.target.value })}>
            <option value="">All</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <Button type="button" onClick={load}>Refresh</Button>
          {allowExport ? <Button type="button" variant="secondary" onClick={exportCsv}>Export CSV</Button> : null}
        </div>
      </Card>

      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Cash in" value={formatCurrency(summary.in_total, currency)} tone="green" />
          <StatCard label="Cash out" value={formatCurrency(summary.out_total, currency)} tone="blue" />
          <StatCard label="Net ledger" value={formatCurrency(summary.net_total, currency)} />
        </div>
      ) : null}

      {loading ? <LoadingState message="Loading ledger..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      <DataTable
        columns={[
          { key: "entry_date", label: "Date", render: (row) => row.entry_date?.slice(0, 10) },
          { key: "branch", label: "Branch", render: (row) => row.branch?.name || "All branches" },
          { key: "entry_type", label: "Type" },
          { key: "direction", label: "Direction" },
          { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount, row.currency_code) },
          { key: "description", label: "Description", render: (row) => row.description || "-" },
          { key: "source_type", label: "Source", render: (row) => sourceLabel(row) },
        ]}
        rows={entries}
        loading={loading}
        error={loadError}
        emptyMessage="No ledger entries yet."
      />
    </div>
  );
}

function sourceLabel(row) {
  const type = row.source_type?.split("\\").pop() || "-";
  return row.source_id ? `${type} #${row.source_id}` : type;
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
