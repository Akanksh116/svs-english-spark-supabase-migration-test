import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminAnalytics } from "@/services/admin-stats.functions";

/** Single source of truth for the Admin → Analytics page. */
export function useAdminAnalytics() {
  const fetchAnalytics = useServerFn(adminAnalytics);
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => fetchAnalytics({ data: undefined }),
  });
}
