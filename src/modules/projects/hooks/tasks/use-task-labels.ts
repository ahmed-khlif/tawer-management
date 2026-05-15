import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignLabelToTask,
  createProjectLabel,
  deleteProjectLabel,
  fetchProjectLabel,
  fetchProjectLabels,
  removeLabelFromTask,
  updateProjectLabel,
} from "@/modules/projects/services/api/project-task-labels";
import {
  CreateTaskLabelPayload,
  UpdateTaskLabelPayload,
} from "@/modules/projects/types/project-tasks";

const KEY = (projectId: string) => ["project-task-labels", projectId] as const;
const DETAIL_KEY = (projectId: string, labelId: string) =>
  ["project-task-label", projectId, labelId] as const;

export function useProjectLabel(projectId?: string, labelId?: string) {
  return useQuery({
    queryKey: DETAIL_KEY(projectId ?? "", labelId ?? ""),
    queryFn: () => fetchProjectLabel(projectId!, labelId!),
    enabled: !!projectId && !!labelId,
    refetchOnWindowFocus: false,
  });
}

export function useTaskLabels(projectId?: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: KEY(projectId ?? ""),
    queryFn: () => fetchProjectLabels(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "") });
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
  };

  const createLabel = useMutation({
    mutationFn: (payload: CreateTaskLabelPayload) => createProjectLabel(projectId!, payload),
    onSuccess: () => {
      toast.success("Label created");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to create label"),
  });

  const updateLabel = useMutation({
    mutationFn: ({ labelId, payload }: { labelId: string; payload: UpdateTaskLabelPayload }) =>
      updateProjectLabel(projectId!, labelId, payload),
    onSuccess: (_data, vars) => {
      toast.success("Label updated");
      invalidate();
      queryClient.invalidateQueries({
        queryKey: DETAIL_KEY(projectId ?? "", vars.labelId),
      });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update label"),
  });

  const deleteLabel = useMutation({
    mutationFn: (labelId: string) => deleteProjectLabel(projectId!, labelId),
    onSuccess: (_data, labelId) => {
      toast.success("Label removed");
      invalidate();
      queryClient.removeQueries({ queryKey: DETAIL_KEY(projectId ?? "", labelId) });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to remove label"),
  });

  const assignLabel = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      assignLabelToTask(projectId!, taskId, labelId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["project-task", projectId, vars.taskId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to assign label"),
  });

  const removeLabel = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      removeLabelFromTask(projectId!, taskId, labelId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["project-task", projectId, vars.taskId] });
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to remove label"),
  });

  return { list, createLabel, updateLabel, deleteLabel, assignLabel, removeLabel };
}

export default useTaskLabels;
