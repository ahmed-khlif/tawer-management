import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import retrieveAssignedProjectTasks from "../../services/extraction/assigned-project-tasks";

export default function useAssignedProjectTasks() {
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = useQuery<ProjectTaskType[]>({
    queryKey: ["assigned-project-tasks", search, projectId, status, priority, type],
    queryFn: () => retrieveAssignedProjectTasks({ search, projectId, status, priority, type }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    tasks: data ?? [],
    tasksAreLoading: isLoading,
    tasksError: isError,
    searchState: [search, setSearch] as [string, (s: string) => void],
    projectIdState: [projectId, setProjectId] as [string | undefined, (s: string | undefined) => void],
    statusState: [status, setStatus] as [string | undefined, (s: string | undefined) => void],
    priorityState: [priority, setPriority] as [string | undefined, (s: string | undefined) => void],
    typeState: [type, setType] as [string | undefined, (s: string | undefined) => void],
  };
}
