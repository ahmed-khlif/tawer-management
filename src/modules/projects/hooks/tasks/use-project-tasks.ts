import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import retrieveProjectTasks, {
  ProjectTasksParams,
} from "../../services/api/project-tasks";

interface UseProjectTasksOptions {
  initialFilters?: {
    status?: string;
    priority?: string;
    type?: string;
    assigneeId?: string;
    milestoneId?: string;
    epicId?: string | null;
    sprintId?: string;
  };
  enabled?: boolean;
}

export default function useProjectTasks(
  projectId: string,
  options?: UseProjectTasksOptions,
) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(
    options?.initialFilters?.status,
  );
  const [priority, setPriority] = useState<string | undefined>(
    options?.initialFilters?.priority,
  );
  const [type, setType] = useState<string | undefined>(
    options?.initialFilters?.type,
  );
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    options?.initialFilters?.assigneeId,
  );
  const [milestoneId, setMilestoneId] = useState<string | undefined>(
    options?.initialFilters?.milestoneId,
  );
  const [epicId, setEpicId] = useState<string | null | undefined>(
    options?.initialFilters?.epicId,
  );
  const [sprintId] = useState<string | undefined>(options?.initialFilters?.sprintId);
  const [displayedTasks, setDisplayedTasks] = useState<ProjectTaskType[]>([]);

  const serverFilters = useMemo<ProjectTasksParams>(
    () => ({
      projectId,
      status,
      priority,
      type,
      assigneeId,
      milestoneId,
      epicId,
      sprintId,
    }),
    [projectId, status, priority, type, assigneeId, milestoneId, epicId, sprintId],
  );

  // NOTE: backend `TaskQueryDto` does not support a `search` field, so it is
  // applied client-side below; only server-side filters are part of the query
  // key so we don't refetch on every keystroke.
  const { data, isLoading, isError } = useQuery<ProjectTaskType[]>({
    queryKey: projectQueryKeys.tasks.list(projectId, serverFilters),
    queryFn: () => retrieveProjectTasks(serverFilters),
    enabled: !!projectId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((task) => {
      const haystack = [task.title, task.key, task.description ?? ""].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [data, search]);

  useEffect(() => {
    setDisplayedTasks(filteredTasks);
  }, [filteredTasks]);

  return {
    tasks: displayedTasks,
    tasksAreLoading: isLoading,
    tasksError: isError,
    searchState: [search, setSearch] as [string, (s: string) => void],
    statusState: [status, setStatus] as [string | undefined, (s: string | undefined) => void],
    priorityState: [priority, setPriority] as [string | undefined, (s: string | undefined) => void],
    typeState: [type, setType] as [string | undefined, (s: string | undefined) => void],
    assigneeState: [assigneeId, setAssigneeId] as [string | undefined, (s: string | undefined) => void],
    milestoneState: [milestoneId, setMilestoneId] as [string | undefined, (s: string | undefined) => void],
    epicState: [epicId, setEpicId] as [
      string | null | undefined,
      (s: string | null | undefined) => void,
    ],
    setDisplayedTasks,
  };
}
