import { useQuery } from "@tanstack/react-query";
import { fetchProjectMilestones } from "@/modules/projects/services/api/project-milestones";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import { MilestoneQueryParams } from "@/modules/projects/types/project-milestones";

export function useProjectMilestones(projectId: string, params?: MilestoneQueryParams) {
  return useQuery({
    queryKey: projectQueryKeys.milestones.list(projectId, params),
    queryFn: () => fetchProjectMilestones(projectId, params),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
}

export default useProjectMilestones;
