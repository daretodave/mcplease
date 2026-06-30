import { QueryClient } from "@tanstack/react-query";

// The single TanStack Query client — the home of all server state (every read/write through the data
// seam is a query, not hand-synced state). Conservative defaults for a share-link app: links rarely
// change underfoot, so no refetch-on-focus churn and a short stale window.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});
