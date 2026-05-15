import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  LogTimeEntryPayload,
  ProjectTaskTimeEntry,
  UpdateTimeEntryPayload,
} from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchTaskTimeEntries(
  projectId: string,
  taskId: string,
): Promise<ProjectTaskTimeEntry[]> {
  if (isMockMode()) return [];
  try {
    const res = await GET(API.TASKS.TIME_ENTRIES(projectId, taskId), getHeaders());
    const list = (res.data?.data ?? res.data ?? []) as ProjectTaskTimeEntry[];
    return Array.isArray(list) ? list : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchTaskTimeEntries(projectId, taskId))) ?? [];
    }
    throw error;
  }
}

export async function logTaskTimeEntry(
  projectId: string,
  taskId: string,
  payload: LogTimeEntryPayload,
): Promise<ProjectTaskTimeEntry> {
  if (isMockMode()) throw new Error("Mock mode cannot log time");
  try {
    const res = await POST(API.TASKS.TIME_ENTRIES(projectId, taskId), getHeaders(), payload);
    return res.data as ProjectTaskTimeEntry;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        logTaskTimeEntry(projectId, taskId, payload),
      )) as ProjectTaskTimeEntry;
    }
    throw error;
  }
}

export async function updateTaskTimeEntry(
  projectId: string,
  taskId: string,
  timeEntryId: string,
  payload: UpdateTimeEntryPayload,
): Promise<ProjectTaskTimeEntry> {
  if (isMockMode()) throw new Error("Mock mode cannot update time");
  try {
    const res = await PATCH(
      API.TASKS.TIME_ENTRY(projectId, taskId, timeEntryId),
      getHeaders(),
      payload,
    );
    return res.data as ProjectTaskTimeEntry;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateTaskTimeEntry(projectId, taskId, timeEntryId, payload),
      )) as ProjectTaskTimeEntry;
    }
    throw error;
  }
}

export async function deleteTaskTimeEntry(
  projectId: string,
  taskId: string,
  timeEntryId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.TIME_ENTRY(projectId, taskId, timeEntryId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteTaskTimeEntry(projectId, taskId, timeEntryId));
      return;
    }
    throw error;
  }
}
