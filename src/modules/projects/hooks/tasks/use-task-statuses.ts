import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectTaskStatus,
  deleteProjectTaskStatus,
  fetchProjectTaskStatuses,
  updateProjectTaskStatus,
} from "@/modules/projects/services/api/project-task-statuses";
import {
  CreateTaskStatusPayload,
  UpdateTaskStatusPayload,
} from "@/modules/projects/types/project-tasks";

const KEY = (projectId: string) => ["project-task-statuses", projectId] as const;

export function useTaskStatuses(projectId?: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: KEY(projectId ?? ""),
    queryFn: () => fetchProjectTaskStatuses(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "") });
    queryClient.invalidateQueries({ queryKey: ["project-kanban", projectId] });
  };

  const createStatus = useMutation({
    mutationFn: (payload: CreateTaskStatusPayload) =>
      createProjectTaskStatus(projectId!, payload),
    onSuccess: () => {
      toast.success("Status created");
      invalidate();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to create status"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ statusId, payload }: { statusId: string; payload: UpdateTaskStatusPayload }) =>
      updateProjectTaskStatus(projectId!, statusId, payload),
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  const deleteStatus = useMutation({
    mutationFn: (statusId: string) => deleteProjectTaskStatus(projectId!, statusId),
    onSuccess: () => {
      toast.success("Status removed");
      invalidate();
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to remove status"),
  });

  return { list, createStatus, updateStatus, deleteStatus };
}

export default useTaskStatuses;
