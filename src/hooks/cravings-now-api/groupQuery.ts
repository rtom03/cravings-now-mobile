import { getGroups, getProductsByGroupName } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export const useGroups = (enabled = true) => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await getGroups();

      return res; // unwrap the { Products: [...] } envelope
    },
    enabled, // query won't fire until this is true
  });
};

export const useProductsByGroupById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await getProductsByGroupName(id);
      // console.log(res);
      return res; // unwrap the { branches: [...] } envelope
    },
    enabled, // query won't fire until this is true
  });
};
