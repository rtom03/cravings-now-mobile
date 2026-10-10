import { getProducts } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useProducts = (enabled = true) => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getProducts();

      return res; // unwrap the { Products: [...] } envelope
    },
    enabled, // query won't fire until this is true
  });
};
