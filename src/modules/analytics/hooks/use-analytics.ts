import { useQuery } from "@tanstack/react-query";
import {
  fetchEmployeeAnalyticsSummary,
  fetchEmployeeProductivityMetrics,
  fetchExecutiveAnalyticsOverview,
} from "@/modules/analytics/services/analytics";

export function useExecutiveAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchExecutiveAnalyticsOverview,
    refetchOnWindowFocus: false,
  });
}

export function useEmployeeAnalyticsSummary(userId?: string | null) {
  return useQuery({
    queryKey: ["analytics-employee-summary", userId],
    queryFn: () => fetchEmployeeAnalyticsSummary(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}

export function useEmployeeProductivityMetrics(userId?: string | null) {
  return useQuery({
    queryKey: ["analytics-employee-productivity", userId],
    queryFn: () => fetchEmployeeProductivityMetrics(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
