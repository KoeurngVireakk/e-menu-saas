import { useQuery } from "@tanstack/react-query";
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
  });
}

export function useShopCategories(shopId) {
  return useQuery({
    queryKey: queryKeys.shopCategories(shopId),
    queryFn: ({ signal }) => getData(`/shops/${shopId}/categories`, undefined, signal).then((data) => data.categories),
    enabled: Boolean(shopId),
  });
}

export function useShopProducts(shopId, filters = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.shopProducts(shopId, params),
    queryFn: ({ signal }) => getData(`/shops/${shopId}/products`, params, signal).then((data) => data.products),
    enabled: Boolean(shopId),
  });
}

export function useOrders(filters = {}, options = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: ({ signal }) => getData("/orders", params, signal),
    ...options,
  });
}

export function usePayments(filters = {}, options = {}) {
  const params = stableFilters(filters);
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: ({ signal }) => getData("/payments", params, signal),
    ...options,
  });
}
