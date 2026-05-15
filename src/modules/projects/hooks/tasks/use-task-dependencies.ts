import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addTaskDependency,
  removeTaskDependency,
} from "@/modules/projects/services/api/project-task-dependencies";
import { AddDependencyPayload } from "@/modules/projects/types/project-tasks";

export function useTaskDependencies(projectId?: string, taskId?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["project-task", projectId, taskId] });
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const addDependency = useMutation({
    mutationFn: (payload: AddDependencyPayload) =>
      addTaskDependency(projectId!, taskId!, payload),
    onSuccess: () => {
      toast.success("Dependency added");
      invalidate();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to add dependency"),
  });

  const removeDependency = useMutation({
    mutationFn: (dependencyId: string) =>
      removeTaskDependency(projectId!, taskId!, dependencyId),
    onSuccess: () => {
      toast.success("Dependency removed");
      invalidate();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to remove dependency"),
  });

  return { addDependency, removeDependency };
}

export default useTaskDependencies;
