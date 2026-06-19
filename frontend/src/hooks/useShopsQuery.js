import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { queryKeys } from "../lib/queryKeys";

export function useShopsQuery() {
  const { authenticated, user } = useAuth();

  return useQuery({
    queryKey: queryKeys.shops,
    queryFn: async ({ signal }) => {
      const response = await api.get("/shops", { signal });
      return response.data.data.shops;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: authenticated || Boolean(user),
  });
}
