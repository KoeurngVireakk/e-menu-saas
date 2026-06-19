import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

export function useBranchesQuery(shopId) {
  return useQuery({
    queryKey: ["branches", shopId],
    queryFn: async () => {
      const response = await api.get(`/shops/${shopId}/branches`);
      return response.data.data.branches;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: Boolean(shopId),
  });
}
