import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addProjectTaskComment,
  deleteProjectTaskComment,
  likeProjectTaskComment,
  updateProjectTaskComment,
} from "@/modules/projects/services/api/project-task-comment";

export function useTaskComment(projectId?: string, taskId?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["project-task", projectId, taskId] });
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const addComment = useMutation({
    mutationFn: ({ content, mentions }: { content: string; mentions?: string[] }) =>
      addProjectTaskComment(projectId!, taskId!, content, mentions),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to add comment"),
  });

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateProjectTaskComment(projectId!, taskId!, commentId, content),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to update comment"),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) =>
      deleteProjectTaskComment(projectId!, taskId!, commentId),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Failed to delete comment"),
  });

  const likeComment = useMutation({
    mutationFn: (commentId: string) =>
      likeProjectTaskComment(projectId!, taskId!, commentId),
    onSuccess: () => {
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to like"),
  });

  return { addComment, updateComment, deleteComment, likeComment };
}

export default useTaskComment;
