import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { queryKeys } from "../lib/queryKeys";

export default function useOnboarding(shopId = null) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.onboarding(shopId);
  const statusQuery = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await api.get("/onboarding", {
        params: shopId ? { shop_id: shopId } : undefined,
        signal,
      });
      return response.data.data;
    },
    staleTime: 15 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async ({ action, payload = {} }) => {
      const scopedPayload = shopId ? { shop_id: shopId, ...payload } : payload;
      const response = action === "update"
        ? await api.patch("/onboarding", scopedPayload)
        : await api.post(`/onboarding/${action}`, scopedPayload);
      return response.data.data;
    },
    onSuccess: (status) => {
      queryClient.setQueryData(queryKey, status);
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  return {
    status: statusQuery.data,
    loading: statusQuery.isPending,
    fetching: statusQuery.isFetching,
    error: statusQuery.error,
    retry: statusQuery.refetch,
    saving: mutation.isPending,
    mutationError: mutation.error,
    setCurrentStep: (currentStep) => mutation.mutateAsync({ action: "update", payload: { current_step: currentStep } }),
    completeStep: (step) => mutation.mutateAsync({ action: "update", payload: { step, completed: true } }),
    dismiss: () => mutation.mutateAsync({ action: "dismiss" }),
    resume: () => mutation.mutateAsync({ action: "resume" }),
  };
}
