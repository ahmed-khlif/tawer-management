import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchProjectKanban,
  moveTaskInKanban,
} from "@/modules/projects/services/api/project-task-kanban";
import { MoveTaskInKanbanPayload } from "@/modules/projects/types/project-tasks";

const KEY = (projectId: string) => ["project-kanban", projectId] as const;

export function useProjectKanban(projectId?: string) {
  const queryClient = useQueryClient();

  const board = useQuery({
    queryKey: KEY(projectId ?? ""),
    queryFn: () => fetchProjectKanban(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  const moveTask = useMutation({
    mutationFn: (payload: MoveTaskInKanbanPayload) => moveTaskInKanban(projectId!, payload),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: KEY(projectId ?? "") });
      const previous = queryClient.getQueryData(KEY(projectId ?? ""));
      // Optimistic move: remove the task from its source column and append to target
      queryClient.setQueryData(KEY(projectId ?? ""), (current: any) => {
        if (!current) return current;
        const columns = (current.columns ?? []).map((column: any) => ({
          ...column,
          tasks: [...(column.tasks ?? [])],
        }));
        let movedTask: any = null;
        for (const column of columns) {
          const idx = column.tasks.findIndex((t: any) => t.id === variables.taskId);
          if (idx >= 0) {
            movedTask = column.tasks[idx];
            column.tasks.splice(idx, 1);
            break;
          }
        }
        if (!movedTask) return current;
        const targetColumn = columns.find(
          (column: any) =>
            column.status === variables.status || column.name === variables.status,
        );
        if (targetColumn) {
          const insertAt =
            typeof variables.displayOrder === "number"
              ? Math.max(0, Math.min(targetColumn.tasks.length, variables.displayOrder))
              : targetColumn.tasks.length;
          targetColumn.tasks.splice(insertAt, 0, {
            ...movedTask,
            status: variables.status,
          });
        }
        return { ...current, columns };
      });
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(KEY(projectId ?? ""), context.previous);
      }
      const code = error?.response?.data?.errorCode as string | undefined;
      const message = error?.response?.data?.message as string | undefined;
      // Translate backend error codes into actionable hints so users
      // understand why a drag was rejected (e.g. AGILE projects only
      // permit BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → TESTING → DONE).
      if (code === "TASK_INVALID_STATUS_TRANSITION") {
        toast.error(
          message ||
            "Invalid status transition. Move the task to the next adjacent column.",
        );
      } else if (code === "TASK_BLOCKED") {
        toast.error(message || "This task is blocked by incomplete dependencies.");
      } else if (code === "INSUFFICIENT_PERMISSION") {
        toast.error(
          message ||
            "Only the assignee, scrum masters, product owners, project managers, or executives can move this task.",
        );
      } else {
        toast.error(message || "Failed to move task");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });
    },
  });

  return { board, moveTask };
}

export default useProjectKanban;
