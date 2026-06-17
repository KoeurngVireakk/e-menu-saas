import { getEcho, getExistingEcho } from "../../lib/echo";

const eventMap = {
  onOrderCreated: ".order.created",
  onOrderStatusChanged: ".order.status_changed",
  onPaymentConfirmed: ".payment.confirmed",
  onKitchenOrderUpdated: ".kitchen.order_updated",
  onTableActivityUpdated: ".table.activity_updated",
};

export async function subscribeToRestaurantOperations(restaurantId, callbacks = {}) {
  return subscribe(`restaurant.${restaurantId}`, callbacks);
}

export async function subscribeToBranchOperations(branchId, callbacks = {}) {
  return subscribe(`branch.${branchId}`, callbacks);
}

export async function subscribeToKitchenOperations(branchId, callbacks = {}) {
  return subscribe(`kitchen.${branchId}`, callbacks);
}

export async function subscribeToOrderTracking(orderId, callbacks = {}) {
  return subscribe(`order.${orderId}`, callbacks);
}

export async function subscribeToTableOperations(tableId, callbacks = {}) {
  return subscribe(`table.${tableId}`, callbacks);
}

export function leaveChannel(channelName) {
  const echo = getExistingEcho();
  if (!echo || !channelName) return;

  echo.leave(channelName);
}

async function subscribe(channelName, callbacks = {}) {
  const echo = await getEcho();
  if (!echo || !channelName) {
    callbacks.onUnavailable?.();
    return () => {};
  }

  const channel = echo.private(channelName);
  Object.entries(eventMap).forEach(([callbackName, eventName]) => {
    if (typeof callbacks[callbackName] === "function") {
      channel.listen(eventName, callbacks[callbackName]);
    }
  });

  return () => leaveChannel(channelName);
}
