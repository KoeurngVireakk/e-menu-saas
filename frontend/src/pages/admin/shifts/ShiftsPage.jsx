import { useCallback, useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import DataTable from "../../../components/DataTable";
import StatusBadge from "../../../components/StatusBadge";
import ShiftReportPrint from "../../../components/print/ShiftReportPrint";
import { Button, Card, ErrorState, Input, LoadingState, Modal, Select, StatCard, Textarea, alertError, confirmAction, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { formatCurrency } from "../../../utils/currency";
import { canAddCashMovement, canCloseShift, canManageShift, canOpenShift } from "../../../utils/permissions";

const movementInitial = { type: "cash_in", amount: "", reason: "", note: "" };

export default function ShiftsPage() {
  const { user } = useAuth();
  const allowOpen = canOpenShift(user);
  const allowMovement = canAddCashMovement(user);
  const allowClose = canCloseShift(user);
  const allowManage = canManageShift(user);
  const [shops, setShops] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", status: "", date: today() });
  const [openingFloat, setOpeningFloat] = useState("");
  const [openNote, setOpenNote] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [closeNote, setCloseNote] = useState("");
  const [movement, setMovement] = useState(movementInitial);
  const [movementShift, setMovementShift] = useState(null);
  const [closeShift, setCloseShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shifts, setShifts] = useState([]);
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
        branch_id: current.branch_id || loaded[0]?.id || "",
      }));
    });
  }, [filters.shop_id]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);
  const currency = selectedShop?.currency_code || "KHR";
  const activeShift = shifts.find((shift) => shift.status === "open" && (!allowManage ? shift.user_id === user?.id : true));

  const load = useCallback(() => {
    if (!filters.shop_id) {
      return;
    }

    setLoading(true);
    setLoadError("");

    api.get("/shifts", { params: cleanParams(filters) })
      .then((response) => setShifts(response.data.data.shifts))
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load shifts.")))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const openShift = async () => {
    try {
      await api.post("/shifts/open", {
        shop_id: filters.shop_id,
        branch_id: filters.branch_id,
        opening_float: openingFloat || 0,
        note: openNote,
      });
      setOpeningFloat("");
      setOpenNote("");
      toastSuccess("Shift opened.");
      load();
    } catch (error) {
      alertError(error, "Unable to open shift.");
    }
  };

  const addMovement = async () => {
    if (!movementShift) return;

    try {
      const response = await api.post(`/shifts/${movementShift.id}/cash-movement`, movement);
      setMovement(movementInitial);
      setMovementShift(null);
      setSelectedShift(response.data.data.shift);
      toastSuccess("Cash movement added.");
      load();
    } catch (error) {
      alertError(error, "Unable to add cash movement.");
    }
  };

  const submitClose = async () => {
    if (!closeShift) return;

    try {
      const response = await api.post(`/shifts/${closeShift.id}/close`, {
        counted_cash_total: countedCash,
        note: closeNote,
      });
      setCountedCash("");
      setCloseNote("");
      setCloseShift(null);
      setSelectedShift(response.data.data.shift);
      toastSuccess("Shift closed.");
      load();
    } catch (error) {
      alertError(error, "Unable to close shift.");
    }
  };

  const cancelShift = async (shift) => {
    if (!await confirmAction("Cancel shift?", `${shift.shift_code} will be cancelled.`)) return;

    await api.post(`/shifts/${shift.id}/cancel`);
    toastSuccess("Shift cancelled.");
    load();
  };

  const loadReport = async (shift) => {
    const response = await api.get(`/shifts/${shift.id}/report`);
    setSelectedShift(response.data.data.report);
  };

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4 p-4 no-print">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
          <Button type="button" onClick={load}>Refresh</Button>
        </div>
      </Card>

      {activeShift ? (
        <Card className="grid gap-4 p-4 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Active Shift</p>
              <h2 className="text-xl font-black text-slate-950">{activeShift.shift_code}</h2>
              <p className="text-sm text-slate-500">{activeShift.branch?.name} · {activeShift.user?.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {allowMovement ? <Button type="button" variant="secondary" onClick={() => setMovementShift(activeShift)}>Cash in/out</Button> : null}
              {allowClose ? <Button type="button" onClick={() => setCloseShift(activeShift)}>Close shift</Button> : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Opening float" value={formatCurrency(activeShift.opening_float, currency)} />
            <StatCard label="Cash in" value={formatCurrency(activeShift.cash_in_total, currency)} tone="green" />
            <StatCard label="Cash out" value={formatCurrency(activeShift.cash_out_total, currency)} tone="blue" />
          </div>
        </Card>
      ) : allowOpen ? (
        <Card className="grid gap-4 p-4 no-print">
          <h1 className="text-xl font-black text-slate-950">Open Shift</h1>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Input label="Opening float" type="number" min="0" step="0.01" value={openingFloat} onChange={(event) => setOpeningFloat(event.target.value)} />
            <Input label="Note" value={openNote} onChange={(event) => setOpenNote(event.target.value)} />
            <Button type="button" className="self-end" disabled={!filters.branch_id} onClick={openShift}>Open shift</Button>
          </div>
        </Card>
      ) : null}

      {loading ? <LoadingState message="Loading shifts..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

      <div className="no-print">
        <DataTable
          columns={[
            { key: "shift_code", label: "Shift" },
            { key: "branch", label: "Branch", render: (row) => row.branch?.name },
            { key: "user", label: "Cashier", render: (row) => row.user?.name },
            { key: "opening_float", label: "Opening", render: (row) => formatCurrency(row.opening_float, currency) },
            { key: "expected_cash_total", label: "Expected", render: (row) => formatCurrency(row.expected_cash_total, currency) },
            { key: "cash_difference", label: "Diff", render: (row) => formatCurrency(row.cash_difference, currency) },
            { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
          ]}
          rows={shifts}
          loading={loading}
          error={loadError}
          emptyMessage="No shifts yet."
          renderActions={(shift) => (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => loadReport(shift)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Report</button>
              {shift.status === "open" && allowMovement ? <button type="button" onClick={() => setMovementShift(shift)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Movement</button> : null}
              {shift.status === "open" && allowClose ? <button type="button" onClick={() => setCloseShift(shift)} className="rounded-md bg-slate-900 px-3 py-1 text-sm text-white">Close</button> : null}
              {shift.status === "open" && allowManage ? <button type="button" onClick={() => cancelShift(shift)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Cancel</button> : null}
            </div>
          )}
        />
      </div>

      {selectedShift ? (
        <Card className="grid gap-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 no-print">
            <h2 className="text-lg font-bold text-slate-950">{selectedShift.shift_code}</h2>
            <Button type="button" variant="secondary" onClick={() => window.print()}>Print report</Button>
          </div>
          <ShiftReportPrint shift={selectedShift} />
        </Card>
      ) : null}

      <Modal
        open={Boolean(movementShift)}
        title="Cash Movement"
        onClose={() => setMovementShift(null)}
        footer={<Button type="button" onClick={addMovement}>Save movement</Button>}
      >
        <div className="grid gap-3 p-4">
          <Select label="Type" value={movement.type} onChange={(event) => setMovement({ ...movement, type: event.target.value })}>
            <option value="cash_in">Cash in</option>
            <option value="cash_out">Cash out</option>
          </Select>
          <Input label="Amount" type="number" min="0.01" step="0.01" value={movement.amount} onChange={(event) => setMovement({ ...movement, amount: event.target.value })} />
          <Input label="Reason" value={movement.reason} onChange={(event) => setMovement({ ...movement, reason: event.target.value })} />
          <Textarea label="Note" rows={3} value={movement.note} onChange={(event) => setMovement({ ...movement, note: event.target.value })} />
        </div>
      </Modal>

      <Modal
        open={Boolean(closeShift)}
        title="Close Shift"
        onClose={() => setCloseShift(null)}
        footer={<Button type="button" onClick={submitClose}>Close shift</Button>}
      >
        <div className="grid gap-3 p-4">
          <Input label="Counted cash" type="number" min="0" step="0.01" value={countedCash} onChange={(event) => setCountedCash(event.target.value)} />
          <Textarea label="Note" rows={3} value={closeNote} onChange={(event) => setCloseNote(event.target.value)} />
        </div>
      </Modal>
    </div>
  );
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
