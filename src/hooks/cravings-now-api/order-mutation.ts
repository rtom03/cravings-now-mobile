// api/orders.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, createOrderQuote } from "@/services/api";

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCreateOrderQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrderQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
