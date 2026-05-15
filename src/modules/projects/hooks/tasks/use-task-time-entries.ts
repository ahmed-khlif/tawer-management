import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteTaskTimeEntry,
  fetchTaskTimeEntries,
  logTaskTimeEntry,
  updateTaskTimeEntry,
} from "@/modules/projects/services/api/project-task-time-entries";
import {
  LogTimeEntryPayload,
  UpdateTimeEntryPayload,
} from "@/modules/projects/types/project-tasks";

const KEY = (projectId: string, taskId: string) =>
  ["task-time-entries", projectId, taskId] as const;

export function useTaskTimeEntries(projectId?: string, taskId?: string) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: KEY(projectId ?? "", taskId ?? ""),
    queryFn: () => fetchTaskTimeEntries(projectId!, taskId!),
    enabled: !!projectId && !!taskId,
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: KEY(projectId ?? "", taskId ?? "") });
    queryClient.invalidateQueries({ queryKey: ["project-task", projectId, taskId] });
    queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    queryClient.invalidateQueries({ queryKey: ["my-workload-summary"] });
  };

  const logEntry = useMutation({
    mutationFn: (payload: LogTimeEntryPayload) =>
      logTaskTimeEntry(projectId!, taskId!, payload),
    onSuccess: () => {
      toast.success("Time logged");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to log time"),
  });

  const updateEntry = useMutation({
    mutationFn: ({
      timeEntryId,
      payload,
    }: {
      timeEntryId: string;
      payload: UpdateTimeEntryPayload;
    }) => updateTaskTimeEntry(projectId!, taskId!, timeEntryId, payload),
    onSuccess: () => {
      toast.success("Time entry updated");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to update entry"),
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => deleteTaskTimeEntry(projectId!, taskId!, id),
    onSuccess: () => {
      toast.success("Time entry deleted");
      invalidate();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Failed to delete entry"),
  });

  return { list, logEntry, updateEntry, deleteEntry };
}

export default useTaskTimeEntries;
