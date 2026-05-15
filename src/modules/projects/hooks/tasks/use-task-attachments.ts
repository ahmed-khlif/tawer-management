import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteTaskAttachment,
  fetchTaskAttachments,
} from "@/modules/projects/services/api/project-task-attachments";

const KEY = (projectId: string, taskId: string) =>
  ["task-attachments", projectId, taskId] as const;

export function useTaskAttachments(projectId?: string, taskId?: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: KEY(projectId ?? "", taskId ?? ""),
    queryFn: () => fetchTaskAttachments(projectId!, taskId!),
    enabled: !!projectId && !!taskId,
    refetchOnWindowFocus: false,
  });

  const remove = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteTaskAttachment(projectId!, taskId!, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "", taskId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-task", projectId, taskId] });
      toast.success("Attachment removed");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to remove attachment"),
  });

  return { list, remove };
}

export default useTaskAttachments;
