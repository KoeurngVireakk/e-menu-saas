import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { queryKeys } from "../lib/queryKeys";

export function useBranchesQuery(shopId) {
  return useQuery({
    queryKey: queryKeys.shopBranches(shopId),
    queryFn: async ({ signal }) => {
      const response = await api.get(`/shops/${shopId}/branches`, { signal });
      return response.data.data.branches;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(shopId),
  });
}
