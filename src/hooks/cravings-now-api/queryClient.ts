import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — don't refetch if data is fresh
      gcTime: 1000 * 60 * 10, // 10 min — keep in cache
      retry: 2, // retry failed requests twice
      refetchOnWindowFocus: false,
    },
  },
});

// TypeScript only:
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient;
