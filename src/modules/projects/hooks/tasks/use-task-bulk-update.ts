import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bulkUpdateTaskStatus } from "@/modules/projects/services/api/project-task-bulk";
import { BulkUpdateStatusPayload } from "@/modules/projects/types/project-tasks";

export function useTaskBulkUpdate(projectId?: string) {
  const queryClient = useQueryClient();

  const bulkStatus = useMutation({
    mutationFn: (payload: BulkUpdateStatusPayload) =>
      bulkUpdateTaskStatus(projectId!, payload),
    onSuccess: () => {
      toast.success("Tasks updated");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-kanban", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-backlog", projectId] });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to bulk update tasks"),
  });

  return { bulkStatus };
}

export default useTaskBulkUpdate;
