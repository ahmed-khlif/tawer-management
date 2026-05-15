import { useQuery } from "@tanstack/react-query";
import { fetchMyTasksInProject } from "@/modules/projects/services";
import {
  MyTaskQueryParams,
  MyTasksList,
} from "@/modules/projects/types/project-tasks";

export function useMyTasksInProject(
  projectId: string | undefined,
  params?: MyTaskQueryParams,
) {
  return useQuery<MyTasksList>({
    queryKey: ["my-tasks-in-project", projectId, params],
    queryFn: () => fetchMyTasksInProject(projectId!, params),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
}

export default useMyTasksInProject;
