import { getAddresses } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await getAddresses();
      return res.addresses; // unwrap the { Products: [...] } envelope
    },
  });
}
