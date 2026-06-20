import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api, { getApiErrorMessage } from "../../../api/axios";
import RealtimeStatusBadge from "../../../components/realtime/RealtimeStatusBadge";
import { Button, ErrorState, Input, LoadingState, Select, alertError, toastSuccess } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { AppButton, AppCard, AppEmptyState, AppPageHeader, AppStatusBadge } from "../../../design-system/components";
import CrudFormModal from "../../../design-system/crud/CrudFormModal";
import OperationStatusTabs from "../../../design-system/operations/OperationStatusTabs";
import BaseKitchenOrderCard from "../../../design-system/operations/KitchenOrderCard";
import useOperationsRealtime from "../../../hooks/useOperationsRealtime";
import { useShopCategories } from "../../../hooks/useApiQueries";
import { useBranchesQuery } from "../../../hooks/useBranchesQuery";
import { useShopsQuery } from "../../../hooks/useShopsQuery";
import { getKitchenSoundMuted, playKitchenBeep, setKitchenSoundMuted } from "../../../utils/kitchenSound";
import { canManageKitchenStations, canUpdateKitchenOrder } from "../../../utils/permissions";

const statusTabs = [
  ["", "All"],
  ["pending", "New"],
  ["accepted", "Accepted"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];
const stationInitial = { branch_id: "", name: "", type: "general", category_ids_json: [], status: "active" };

export default function KitchenPage() {
  const { user } = useAuth();
  const allowUpdate = canUpdateKitchenOrder(user);
  const allowStations = canManageKitchenStations(user);
  const { data: shops = [] } = useShopsQuery();
  const [stations, setStations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ shop_id: "", branch_id: "", station_id: "", status: "", date: today() });
  const [muted, setMuted] = useState(() => getKitchenSoundMuted());
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [stationForm, setStationForm] = useState(stationInitial);
  const [editingStation, setEditingStation] = useState(null);
  const [stationModal, setStationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const seenOrderIds = useRef(new Set());
  const firstLoad = useRef(true);
  const { data: branches = [] } = useBranchesQuery(filters.shop_id);
  const { data: categories = [] } = useShopCategories(filters.shop_id);

  useEffect(() => {
    if (shops.length && !filters.shop_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, shop_id: shops[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [filters.shop_id, shops]);

  useEffect(() => {
    if (!filters.shop_id) return;

    api.get(`/shops/${filters.shop_id}/kitchen-stations`).then((stationsResponse) => {
      setStations(stationsResponse.data.data.kitchen_stations);
    });
  }, [filters.shop_id]);

  useEffect(() => {
    if (branches.length && (user?.role === "cashier" || user?.role === "waiter") && !filters.branch_id) {
      const timer = window.setTimeout(() => {
        setFilters((current) => ({ ...current, branch_id: branches[0].id }));
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [branches, filters.branch_id, user?.role]);

  const detectNewOrders = useCallback((loaded) => {
    const ids = loaded.map((order) => order.id);
    if (firstLoad.current) {
      ids.forEach((id) => seenOrderIds.current.add(id));
      firstLoad.current = false;
      return;
    }

    const fresh = ids.filter((id) => !seenOrderIds.current.has(id));
    ids.forEach((id) => seenOrderIds.current.add(id));
    if (!fresh.length) return;

    setNewOrderIds(new Set(fresh));
    window.setTimeout(() => setNewOrderIds(new Set()), 6000);
    if (!muted) {
      playKitchenBeep().catch(() => setSoundBlocked(true));
    }
  }, [muted]);

  const load = useCallback((silent = false) => {
    if (!filters.shop_id || ((user?.role === "cashier" || user?.role === "waiter") && !filters.branch_id)) return;

    if (!silent) setLoading(true);
    setLoadError("");

    api.get("/kitchen/orders", { params: cleanParams(filters) })
      .then((response) => {
        const loaded = response.data.data.orders;
        setSummary(response.data.data.summary);
        detectNewOrders(loaded);
        setOrders(loaded);
      })
      .catch((error) => setLoadError(getApiErrorMessage(error, "Unable to load kitchen orders.")))
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [detectNewOrders, filters, user?.role]);

  const handleRealtimeOrder = useCallback(() => {
    load(true);
    if (!muted) {
      playKitchenBeep().catch(() => setSoundBlocked(true));
    }
  }, [load, muted]);

  const realtimeStatus = useOperationsRealtime({
    kitchenBranchId: filters.branch_id,
    enabled: Boolean(filters.branch_id),
    onOrderCreated: handleRealtimeOrder,
    onKitchenOrderUpdated: () => load(true),
    onOrderStatusChanged: () => load(true),
  });

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 0);
    const interval = window.setInterval(() => load(true), 7000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [load]);

  const selectedShop = useMemo(() => shops.find((shop) => String(shop.id) === String(filters.shop_id)), [shops, filters.shop_id]);
  const grouped = useMemo(() => groupOrders(orders), [orders]);
  const visibleStatuses = filters.status ? [filters.status] : ["pending", "accepted", "preparing", "ready", "completed", "cancelled"];
  const statusCounts = useMemo(() => {
    const counts = { "": orders.length };
    orders.forEach((order) => {
      counts[order.order_status] = (counts[order.order_status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setKitchenSoundMuted(next);
  };

  const enableSound = () => {
    playKitchenBeep()
      .then(() => {
        setMuted(false);
        setKitchenSoundMuted(false);
        setSoundBlocked(false);
      })
      .catch(() => setSoundBlocked(true));
  };

  const updateOrder = async (order, order_status) => {
    try {
      await api.put(`/kitchen/orders/${order.id}/status`, { order_status });
      toastSuccess("Kitchen order updated.");
      load(true);
    } catch (error) {
      alertError(error, "Unable to update kitchen order.");
    }
  };

  const updateItem = async (item, kitchen_status) => {
    try {
      await api.put(`/kitchen/order-items/${item.id}/status`, { kitchen_status });
      toastSuccess("Kitchen item updated.");
      load(true);
    } catch (error) {
      alertError(error, "Unable to update kitchen item.");
    }
  };

  const submitStation = async () => {
    try {
      const payload = {
        ...stationForm,
        branch_id: stationForm.branch_id || null,
        category_ids_json: stationForm.category_ids_json.map(Number),
      };

      if (editingStation) {
        await api.put(`/kitchen-stations/${editingStation.id}`, payload);
      } else {
        await api.post(`/shops/${filters.shop_id}/kitchen-stations`, payload);
      }

      closeStationModal();
      const response = await api.get(`/shops/${filters.shop_id}/kitchen-stations`);
      setStations(response.data.data.kitchen_stations);
      toastSuccess("Kitchen station saved.");
    } catch (error) {
      alertError(error, "Unable to save kitchen station.");
    }
  };

  const openStationModal = (station = null) => {
    setEditingStation(station);
    setStationForm(station ? {
      branch_id: station.branch_id || "",
      name: station.name || "",
      type: station.type || "general",
      category_ids_json: station.category_ids_json || [],
      status: station.status || "active",
    } : stationInitial);
    setStationModal(true);
  };

  const closeStationModal = () => {
    setEditingStation(null);
    setStationForm(stationInitial);
    setStationModal(false);
  };

  const archiveStation = async (station) => {
    try {
      await api.delete(`/kitchen-stations/${station.id}`);
      const response = await api.get(`/shops/${filters.shop_id}/kitchen-stations`);
      setStations(response.data.data.kitchen_stations);
      toastSuccess("Kitchen station archived.");
    } catch (error) {
      alertError(error, "Unable to archive kitchen station.");
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-5rem)] gap-5">
      <AppPageHeader
        eyebrow="Kitchen Display"
        title={selectedShop?.name || "Kitchen"}
        description={`${summary?.active_count || 0} active orders · auto-refresh every 7 seconds · real-time ready for connected branches.`}
        primaryAction={{ children: "Refresh", onClick: () => load(), variant: "secondary" }}
        secondaryActions={(
          <>
            <RealtimeStatusBadge status={realtimeStatus} />
            <AppButton type="button" variant={muted ? "secondary" : "primary"} onClick={toggleMute}>{muted ? "Sound muted" : "Sound on"}</AppButton>
            {soundBlocked ? <AppButton type="button" onClick={enableSound}>Enable sound</AppButton> : null}
            <AppButton type="button" variant="secondary" onClick={() => document.documentElement.requestFullscreen?.()}>Full screen</AppButton>
            {allowStations ? <AppButton type="button" onClick={() => openStationModal()}>Add station</AppButton> : null}
          </>
        )}
      />

      <AppCard bodyClassName="grid gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Shop" value={filters.shop_id} onChange={(event) => setFilters({ ...filters, shop_id: event.target.value, branch_id: "", station_id: "" })}>
            {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
          </Select>
          <Select label="Branch" value={filters.branch_id} onChange={(event) => setFilters({ ...filters, branch_id: event.target.value })}>
            {user?.role !== "cashier" && user?.role !== "waiter" ? <option value="">All branches</option> : null}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <Select label="Station" value={filters.station_id} onChange={(event) => setFilters({ ...filters, station_id: event.target.value })}>
            <option value="">All stations</option>
            {stations.filter((station) => station.status === "active").map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}
          </Select>
          <Input label="Date" type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        </div>

        <OperationStatusTabs
          value={filters.status}
          onChange={(status) => setFilters({ ...filters, status })}
          options={statusTabs.map(([value, label]) => [value, label, statusCounts[value] || 0])}
        />
      </AppCard>

      {loading ? <LoadingState message="Loading kitchen orders..." /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={() => load()} /> : null}

      {!loading && !loadError ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {visibleStatuses.map((status) => (
            <section key={status} className="grid content-start gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-white">
                <h2 className="text-sm font-black uppercase tracking-wide">{status === "pending" ? "new" : status}</h2>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-black">{grouped[status]?.length || 0}</span>
              </div>
              {(grouped[status] || []).map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  isNew={newOrderIds.has(order.id)}
                  allowUpdate={allowUpdate}
                  onOrderStatus={updateOrder}
                  onItemStatus={updateItem}
                />
              ))}
              {!(grouped[status] || []).length ? (
                <AppEmptyState title={`No ${status === "pending" ? "new" : status} orders`} description="Orders in this state will appear here automatically." />
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {allowStations ? (
        <AppCard className="grid gap-3" bodyClassName="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">Routing</p>
              <h2 className="text-lg font-black text-slate-950">Kitchen Stations</h2>
            </div>
            <Button type="button" size="sm" onClick={() => openStationModal()}>Add station</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {stations.map((station) => (
              <div key={station.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-950">{station.name}</p>
                    <p className="text-sm text-slate-500">{station.branch?.name || "All branches"} · {station.type}</p>
                    <p className="mt-1 text-xs text-slate-500">{station.category_ids_json?.length || 0} assigned categories</p>
                  </div>
                  <AppStatusBadge value={station.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => openStationModal(station)} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Edit</button>
                  {station.status !== "inactive" ? <button type="button" onClick={() => archiveStation(station)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">Archive</button> : null}
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      ) : null}

      <CrudFormModal
        open={stationModal}
        title={editingStation ? "Edit Kitchen Station" : "Add Kitchen Station"}
        description="Route categories and branch orders to the correct preparation station."
        onClose={closeStationModal}
        onSubmit={(event) => {
          event.preventDefault();
          submitStation();
        }}
        submitLabel="Save station"
      >
          <Input label="Station name" value={stationForm.name} onChange={(event) => setStationForm({ ...stationForm, name: event.target.value })} />
          <Select label="Type" value={stationForm.type} onChange={(event) => setStationForm({ ...stationForm, type: event.target.value })}>
            {["general", "kitchen", "bar", "dessert"].map((type) => <option key={type} value={type}>{type}</option>)}
          </Select>
          <Select label="Branch" value={stationForm.branch_id} onChange={(event) => setStationForm({ ...stationForm, branch_id: event.target.value })}>
            <option value="">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </Select>
          <label className="block text-sm font-medium text-slate-700">
            Categories
            <select
              multiple
              className="mt-1 h-32 w-full rounded-md border border-slate-300 px-3 py-2"
              value={stationForm.category_ids_json.map(String)}
              onChange={(event) => setStationForm({
                ...stationForm,
                category_ids_json: Array.from(event.target.selectedOptions).map((option) => option.value),
              })}
            >
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <Select label="Status" value={stationForm.status} onChange={(event) => setStationForm({ ...stationForm, status: event.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
      </CrudFormModal>
    </div>
  );
}

export function KitchenOrderCard({ order, isNew = false, allowUpdate = true, onOrderStatus, onItemStatus }) {
  return <BaseKitchenOrderCard order={order} isNew={isNew} allowUpdate={allowUpdate} onOrderStatus={onOrderStatus} onItemStatus={onItemStatus} />;
}

function groupOrders(orders) {
  return orders.reduce((groups, order) => {
    groups[order.order_status] = [...(groups[order.order_status] || []), order];
    return groups;
  }, {});
}

function cleanParams(values) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
