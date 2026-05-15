import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchProjectBacklog,
  moveBacklogTaskToSprint,
  reorderProjectBacklog,
} from "@/modules/projects/services/api/project-task-backlog";
import {
  MoveToSprintPayload,
  ReorderBacklogPayload,
} from "@/modules/projects/types/project-tasks";

const KEY = (projectId: string) => ["project-backlog", projectId] as const;

export function useProjectBacklog(projectId?: string) {
  const queryClient = useQueryClient();

  const backlog = useQuery({
    queryKey: KEY(projectId ?? ""),
    queryFn: () => fetchProjectBacklog(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  const reorder = useMutation({
    mutationFn: (payload: ReorderBacklogPayload) => reorderProjectBacklog(projectId!, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: KEY(projectId ?? "") });
      const previous = queryClient.getQueryData(KEY(projectId ?? ""));
      queryClient.setQueryData(KEY(projectId ?? ""), (current: any) => {
        if (!Array.isArray(current)) return current;
        const orderById = new Map<string, number>(
          payload.tasks.map((entry) => [entry.taskId, entry.displayOrder]),
        );
        const lookup = new Map<string, any>(current.map((t: any) => [t.id, t]));
        const reordered = [...payload.tasks]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((entry) => lookup.get(entry.taskId))
          .filter(Boolean);
        const remaining = current.filter((t: any) => !orderById.has(t.id));
        return [...reordered, ...remaining];
      });
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(KEY(projectId ?? ""), context.previous);
      toast.error(error?.response?.data?.message || "Failed to reorder backlog");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
  });

  const moveToSprint = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: MoveToSprintPayload }) =>
      moveBacklogTaskToSprint(projectId!, taskId, payload),
    onSuccess: () => {
      toast.success("Task moved to sprint");
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-sprints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprint-tasks"] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to move task"),
  });

  return { backlog, reorder, moveToSprint };
}

export default useProjectBacklog;
