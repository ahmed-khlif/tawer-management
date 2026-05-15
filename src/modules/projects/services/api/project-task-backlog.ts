import { GET, PATCH, POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  MoveToSprintPayload,
  ProjectTaskType,
  ReorderBacklogPayload,
} from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchProjectBacklog(
  projectId: string,
): Promise<ProjectTaskType[]> {
  if (isMockMode()) return [];
  try {
    const res = await GET(API.TASKS.BACKLOG(projectId), getHeaders());
    const list = (res.data?.data ?? res.data ?? []) as unknown[];
    return Array.isArray(list)
      ? list.map((task) => castProjectTaskToFrontend(task as any))
      : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectBacklog(projectId))) ?? [];
    }
    throw error;
  }
}

export async function reorderProjectBacklog(
  projectId: string,
  payload: ReorderBacklogPayload,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await PATCH(API.TASKS.REORDER_BACKLOG(projectId), getHeaders(), payload);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => reorderProjectBacklog(projectId, payload));
      return;
    }
    throw error;
  }
}

export async function moveBacklogTaskToSprint(
  projectId: string,
  taskId: string,
  payload: MoveToSprintPayload,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await POST(API.TASKS.MOVE_TO_SPRINT(projectId, taskId), getHeaders(), payload);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => moveBacklogTaskToSprint(projectId, taskId, payload));
      return;
    }
    throw error;
  }
}
