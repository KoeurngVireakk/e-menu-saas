import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export function useShopsQuery() {
  const { authenticated, user } = useAuth();

  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const response = await api.get("/shops");
      return response.data.data.shops;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: authenticated || Boolean(user),
  });
}
