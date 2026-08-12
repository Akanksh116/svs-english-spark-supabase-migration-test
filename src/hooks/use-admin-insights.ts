import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboardInsights } from "@/services/admin-stats.functions";

/**
 * Single source of truth for every admin dashboard widget. All values come
 * from the database — components render empty states when there is no data.
 */
export function useAdminInsights() {
  const fetchInsights = useServerFn(adminDashboardInsights);
  return useQuery({
    queryKey: ["admin", "dashboard-insights"],
    queryFn: () => fetchInsights({ data: undefined }),
  });
}
