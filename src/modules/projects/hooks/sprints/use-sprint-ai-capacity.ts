import { useQuery } from "@tanstack/react-query";
import { fetchSprintAiCapacity } from "@/modules/projects/services/api/sprint-ai-capacity";

export function useSprintAiCapacity(projectId?: string | null, sprintId?: string | null) {
  return useQuery({
    queryKey: ["sprint-ai-capacity", projectId, sprintId],
    queryFn: () => fetchSprintAiCapacity(projectId!, sprintId!),
    enabled: !!projectId && !!sprintId,
    refetchOnWindowFocus: false,
  });
}

export default useSprintAiCapacity;
