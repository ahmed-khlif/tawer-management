import { useQuery } from "@tanstack/react-query";
import {
  fetchEmployeeAnalyticsSnapshot,
  fetchEmployeeAnalyticsSummary,
  fetchEmployeeProductivityMetrics,
  fetchExecutiveAnalyticsSnapshot,
  fetchExecutiveAnalyticsOverview,
} from "@/modules/analytics/services/analytics";

export function useExecutiveAnalyticsOverview(enabled = true) {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchExecutiveAnalyticsOverview,
    enabled,
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

export function useExecutiveAnalyticsSnapshot(enabled = true) {
  return useQuery({
    queryKey: ["analytics-overview-snapshot"],
    queryFn: fetchExecutiveAnalyticsSnapshot,
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useEmployeeAnalyticsSnapshot(userId?: string | null) {
  return useQuery({
    queryKey: ["analytics-employee-snapshot", userId],
    queryFn: () => fetchEmployeeAnalyticsSnapshot(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
