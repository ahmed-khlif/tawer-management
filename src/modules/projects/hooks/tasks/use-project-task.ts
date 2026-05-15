import { useQuery } from "@tanstack/react-query";
import { retrieveProjectTaskById } from "@/modules/projects/services/api/project-tasks";
import { projectQueryKeys } from "@/modules/projects/query-keys";

/**
 * Fetch the full task detail (`GET /projects/:projectId/tasks/:taskId`).
 *
 * Use this whenever the user opens the task detail sheet — the project task
 * list endpoint only returns the `TaskSummaryDto`, so fields like
 * `description`, `comments`, `dependencies`, `labels`, and `timeEntries`
 * are only available on the detail endpoint.
 */
export default function useProjectTask(
  projectId: string,
  taskId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: taskId
      ? projectQueryKeys.tasks.detail(projectId, taskId)
      : ["project-task", projectId, "empty"],
    queryFn: () => retrieveProjectTaskById(projectId, taskId!),
    enabled: !!projectId && !!taskId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}
