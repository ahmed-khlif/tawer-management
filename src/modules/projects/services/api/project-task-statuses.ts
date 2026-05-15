import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  CreateTaskStatusPayload,
  ProjectTaskStatus,
  ProjectTaskStatusInResponse,
  UpdateTaskStatusPayload,
} from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

function castStatus(raw: ProjectTaskStatusInResponse): ProjectTaskStatus {
  return { ...raw };
}

export async function fetchProjectTaskStatuses(projectId: string): Promise<ProjectTaskStatus[]> {
  if (isMockMode()) return [];
  try {
    const res = await GET(API.TASKS.STATUSES(projectId), getHeaders());
    const list = (res.data?.data ?? res.data ?? []) as ProjectTaskStatusInResponse[];
    return Array.isArray(list) ? list.map(castStatus) : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectTaskStatuses(projectId))) ?? [];
    }
    throw error;
  }
}

export async function createProjectTaskStatus(
  projectId: string,
  payload: CreateTaskStatusPayload,
): Promise<ProjectTaskStatus> {
  if (isMockMode()) {
    return {
      id: "mock",
      projectId,
      name: payload.name,
      color: payload.color ?? "#6B7280",
      displayOrder: payload.displayOrder ?? 1,
      isSystem: false,
      allowedTransitions: payload.allowedTransitions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    const res = await POST(API.TASKS.STATUSES(projectId), getHeaders(), payload);
    return castStatus(res.data as ProjectTaskStatusInResponse);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => createProjectTaskStatus(projectId, payload))) as ProjectTaskStatus;
    }
    throw error;
  }
}

export async function updateProjectTaskStatus(
  projectId: string,
  statusId: string,
  payload: UpdateTaskStatusPayload,
): Promise<ProjectTaskStatus> {
  if (isMockMode()) throw new Error("Cannot update in mock mode");
  try {
    const res = await PATCH(API.TASKS.STATUS(projectId, statusId), getHeaders(), payload);
    return castStatus(res.data as ProjectTaskStatusInResponse);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateProjectTaskStatus(projectId, statusId, payload),
      )) as ProjectTaskStatus;
    }
    throw error;
  }
}

export async function deleteProjectTaskStatus(
  projectId: string,
  statusId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.STATUS(projectId, statusId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteProjectTaskStatus(projectId, statusId));
      return;
    }
    throw error;
  }
}
