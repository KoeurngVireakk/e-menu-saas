import { useEffect, useMemo, useRef, useState } from "react";
import { getEcho, isRealtimeConfigured } from "../lib/echo";
import {
  subscribeToBranchOperations,
  subscribeToKitchenOperations,
  subscribeToOrderTracking,
  subscribeToRestaurantOperations,
  subscribeToTableOperations,
} from "../services/realtime/operationsRealtimeService";

export default function useOperationsRealtime({
  restaurantId,
  branchId,
  kitchenBranchId,
  orderId,
  tableId,
  enabled = true,
  ...callbacks
} = {}) {
  const [status, setStatus] = useState("connecting");
  const restaurantIds = useMemo(() => normalizeIds(restaurantId), [restaurantId]);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    if (!isRealtimeConfigured()) {
      callbacksRef.current.onUnavailable?.();
      return undefined;
    }

    let cancelled = false;
    let connection = null;

    const setConnected = () => setStatus("connected");
    const setConnecting = () => setStatus("connecting");
    const setDisconnected = () => setStatus("disconnected");
    const setError = () => setStatus("error");

    async function bindConnectionStatus() {
      try {
        const echo = await getEcho();

        if (cancelled) {
          return;
        }

        if (!echo) {
          setStatus("unavailable");
          callbacksRef.current.onUnavailable?.();
          return;
        }

        connection = echo.connector?.pusher?.connection;
        connection?.bind("connected", setConnected);
        connection?.bind("connecting", setConnecting);
        connection?.bind("disconnected", setDisconnected);
        connection?.bind("error", setError);
        connection?.bind("unavailable", setError);
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    bindConnectionStatus();

    return () => {
      cancelled = true;
      connection?.unbind("connected", setConnected);
      connection?.unbind("connecting", setConnecting);
      connection?.unbind("disconnected", setDisconnected);
      connection?.unbind("error", setError);
      connection?.unbind("unavailable", setError);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!isRealtimeConfigured()) return undefined;

    let active = true;
    const unsubscribers = [];
    const wrappedCallbacks = wrapCallbacks(callbacksRef);

    async function subscribe() {
      const nextUnsubscribers = await Promise.all([
        ...restaurantIds.map((id) => subscribeToRestaurantOperations(id, wrappedCallbacks)),
        branchId ? subscribeToBranchOperations(branchId, wrappedCallbacks) : null,
        kitchenBranchId ? subscribeToKitchenOperations(kitchenBranchId, wrappedCallbacks) : null,
        orderId ? subscribeToOrderTracking(orderId, wrappedCallbacks) : null,
        tableId ? subscribeToTableOperations(tableId, wrappedCallbacks) : null,
      ].filter(Boolean));

      if (!active) {
        nextUnsubscribers.forEach((unsubscribe) => unsubscribe());
        return;
      }

      unsubscribers.push(...nextUnsubscribers);
    }

    subscribe().catch(() => {
      if (active) {
        setStatus("error");
      }
    });

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [branchId, enabled, kitchenBranchId, orderId, restaurantIds, tableId]);

  if (!enabled) return "disconnected";
  if (!isRealtimeConfigured()) return "unavailable";

  return status;
}

function normalizeIds(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

function wrapCallbacks(callbacksRef) {
  return {
    onOrderCreated: (payload) => callbacksRef.current.onOrderCreated?.(payload),
    onOrderStatusChanged: (payload) => callbacksRef.current.onOrderStatusChanged?.(payload),
    onPaymentConfirmed: (payload) => callbacksRef.current.onPaymentConfirmed?.(payload),
    onKitchenOrderUpdated: (payload) => callbacksRef.current.onKitchenOrderUpdated?.(payload),
    onTableActivityUpdated: (payload) => callbacksRef.current.onTableActivityUpdated?.(payload),
    onUnavailable: () => callbacksRef.current.onUnavailable?.(),
  };
}
