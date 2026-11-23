import { listOrders } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useListOrders = (enabled = true, customerId: string) =>
  useQuery({
    queryKey: ["orders", customerId], // invalidating ["orders"] matches this prefix
    queryFn: () => listOrders({ customerId }),
    enabled,
    refetchInterval: 30000, // backstop if the stream drops
    refetchOnWindowFocus: true,
  });
