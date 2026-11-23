import { ListOrdersParams } from "../types/order";

export const toQuery = (params: ListOrdersParams): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};
