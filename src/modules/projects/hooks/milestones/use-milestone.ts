import { useQuery } from "@tanstack/react-query";
import { fetchProjectMilestone } from "@/modules/projects/services/api/project-milestones";
import { projectQueryKeys } from "@/modules/projects/query-keys";

export function useMilestone(
  projectId: string,
  milestoneId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: milestoneId
      ? projectQueryKeys.milestones.detail(projectId, milestoneId)
      : ["project-milestone", projectId, "empty"],
    queryFn: () => fetchProjectMilestone(projectId, milestoneId!),
    enabled: !!projectId && !!milestoneId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}

export default useMilestone;
