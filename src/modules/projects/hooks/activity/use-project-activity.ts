import { useQuery } from "@tanstack/react-query";
import { fetchProjectActivity } from "@/modules/projects/services/api/project-activity";
import type { ProjectActivityFilters } from "@/modules/projects/types/project-activity";

export function useProjectActivity(
  filters: ProjectActivityFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: ["project-activity", filters],
    queryFn: async () => fetchProjectActivity(filters),
    enabled,
  });
}
