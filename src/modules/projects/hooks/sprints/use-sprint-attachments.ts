import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteSprintAttachment,
  listSprintAttachments,
  uploadSprintAttachments,
} from "@/modules/projects/services/api/sprint-attachments";

const KEY = (projectId: string, sprintId: string) =>
  ["sprint-attachments", projectId, sprintId] as const;

export function useSprintAttachments(projectId?: string | null, sprintId?: string | null) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: KEY(projectId ?? "", sprintId ?? ""),
    queryFn: () => listSprintAttachments(projectId!, sprintId!),
    enabled: !!projectId && !!sprintId,
    refetchOnWindowFocus: false,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadSprintAttachments(projectId!, sprintId!, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "", sprintId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-sprints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["sprint", sprintId] });
      toast.success("Attachments uploaded");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload attachments");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteSprintAttachment(projectId!, sprintId!, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "", sprintId ?? "") });
      queryClient.invalidateQueries({ queryKey: ["project-sprints", projectId] });
      toast.success("Attachment removed");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove attachment");
    },
  });

  return { list, uploadAttachments: uploadMutation, deleteAttachment: deleteMutation };
}

export default useSprintAttachments;
