import { useQuery } from "@tanstack/react-query";
import { fetchProjectEpic } from "@/modules/projects/services/api/project-epics";
import { projectQueryKeys } from "@/modules/projects/query-keys";

export function useEpic(
  projectId: string,
  epicId?: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: epicId
      ? projectQueryKeys.epics.detail(projectId, epicId)
      : ["project-epic", projectId, "empty"],
    queryFn: () => fetchProjectEpic(projectId, epicId!),
    enabled: !!projectId && !!epicId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}

export default useEpic;
