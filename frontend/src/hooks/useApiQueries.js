import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { queryKeys, stableFilters } from "../lib/queryKeys";

async function getData(url, params, signal) {
  const response = await api.get(url, { params, signal });
  return response.data.data;
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    // Keep session bootstrap alive across React StrictMode's development-only
    // unmount/remount so both mounts reuse the same in-flight request.
    queryFn: () => getData("/auth/me").then((data) => data.user),
    enabled,
    retry: false,
    staleTime: 60 * 1000,
  });
}

export function useAccountProfile(options = {}) {
  return useQuery({
    queryKey: queryKeys.accountProfile,
    queryFn: ({ signal }) => getData("/account/profile", undefined, signal).then((data) => data.profile),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAccountPreferences(options = {}) {
  return useQuery({
    queryKey: queryKeys.accountPreferences,
    queryFn: ({ signal }) => getData("/account/preferences", undefined, signal).then((data) => data.preferences),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useAccountActivity(options = {}) {
  return useQuery({
    queryKey: queryKeys.accountActivity,
    queryFn: ({ signal }) => getData("/account/activity", { per_page: 6 }, signal),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useShopCategories(shopId) {
  return useQuery({
    queryKey: queryKeys.shopCategories(shopId),
    queryFn: ({ signal }) => getData(`/shops/${shopId}/categories`, undefined, signal).then((data) => data.categories),
    enabled: Boolean(shopId),
    staleTime: 60 * 1000,
  });
}

export function useShopProducts(shopId, filters = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.shopProducts(shopId, params),
    queryFn: ({ signal }) => getData(`/shops/${shopId}/products`, params, signal).then((data) => data.products),
    enabled: Boolean(shopId),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useBranchTables(branchId, options = {}) {
  return useQuery({
    queryKey: queryKeys.branchTables(branchId),
    queryFn: ({ signal }) => getData(`/branches/${branchId}/tables`, undefined, signal).then((data) => data.tables),
    enabled: Boolean(branchId),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useNotifications(filters = {}, options = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: ({ signal }) => getData("/notifications", params, signal),
    staleTime: 15 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useNotificationUnreadCount(options = {}) {
  return useQuery({
    queryKey: queryKeys.notificationUnreadCount,
    queryFn: ({ signal }) => getData("/notifications/unread-count", undefined, signal).then((data) => data.count),
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
    ...options,
  });
}

export function useOrders(filters = {}, options = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: ({ signal }) => getData("/orders", params, signal),
    staleTime: 10 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function usePayments(filters = {}, options = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: ({ signal }) => getData("/payments", params, signal),
    staleTime: 10 * 1000,
    placeholderData: keepPreviousData,
    ...options,
  });
}
