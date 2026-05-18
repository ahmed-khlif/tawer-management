import { useQuery } from "@tanstack/react-query";
import { fetchProjectDashboardSnapshot } from "@/modules/projects/services/api/project-dashboard-snapshot";

export function useProjectAnalyticsSnapshot(projectId: string) {
  return useQuery({
    queryKey: ["project-dashboard-snapshot", projectId],
    queryFn: () => fetchProjectDashboardSnapshot(projectId),
    enabled: Boolean(projectId),
  });
}
