import { useQuery } from "@tanstack/react-query";
import { fetchTasksInSprint } from "@/modules/projects/services/api/sprint-tasks";

export function useSprintTasks(projectId?: string | null, sprintId?: string | null) {
  return useQuery({
    queryKey: ["sprint-tasks", projectId, sprintId],
    queryFn: () => fetchTasksInSprint(projectId!, sprintId!),
    enabled: !!projectId && !!sprintId,
    refetchOnWindowFocus: false,
  });
}

export default useSprintTasks;
