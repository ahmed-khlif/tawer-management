import { useQuery } from "@tanstack/react-query";
import { fetchProjectEpics } from "@/modules/projects/services/api/project-epics";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import { EpicQueryParams } from "@/modules/projects/types/project-epics";

interface Options {
  enabled?: boolean;
}

export function useProjectEpics(
  projectId: string,
  params?: EpicQueryParams,
  options?: Options,
) {
  return useQuery({
    queryKey: projectQueryKeys.epics.list(projectId, params),
    queryFn: () => fetchProjectEpics(projectId, params),
    enabled: !!projectId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}

export default useProjectEpics;
