import { useQuery } from "@tanstack/react-query";
import { retrieveSprintById } from "@/modules/projects/services/api/project-sprints";
import { projectQueryKeys } from "@/modules/projects/query-keys";

/**
 * Fetch the full sprint detail (`GET /sprints/:id`).
 *
 * Use this when opening the sprint detail sheet. The list endpoint only
 * returns a summary; the detail endpoint additionally exposes attachments,
 * reports, members, etc.
 */
export default function useSprint(
  sprintId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: sprintId
      ? projectQueryKeys.sprints.detail(sprintId)
      : ["sprint", "empty"],
    queryFn: () => retrieveSprintById(sprintId!),
    enabled: !!sprintId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}
