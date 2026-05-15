import { useQuery } from "@tanstack/react-query";
import { fetchProjectMilestoneGantt } from "@/modules/projects/services/api/project-milestones";
import { projectQueryKeys } from "@/modules/projects/query-keys";

export function useMilestoneGantt(projectId: string) {
  return useQuery({
    queryKey: projectQueryKeys.milestones.gantt(projectId),
    queryFn: () => fetchProjectMilestoneGantt(projectId),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
}

export default useMilestoneGantt;
