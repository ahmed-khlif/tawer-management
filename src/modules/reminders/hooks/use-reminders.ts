import { useQuery } from "@tanstack/react-query";
import { fetchMyReminders, fetchProjectReminders } from "@/modules/reminders/services/reminders";
import { projectQueryKeys } from "@/modules/projects/query-keys";
import { ReminderQueryParams } from "@/modules/reminders/types";

export function useProjectReminders(
  projectId: string,
  params?: ReminderQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: projectQueryKeys.reminders.list(projectId, params),
    queryFn: () => fetchProjectReminders(projectId, params),
    enabled: !!projectId && (options?.enabled ?? true),
    refetchOnWindowFocus: false,
  });
}

export function useMyReminders(
  params?: ReminderQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: projectQueryKeys.reminders.mine(params),
    queryFn: () => fetchMyReminders(params),
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
}
