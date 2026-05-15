import { GET, POST, PATCH, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  CreateTaskLabelPayload,
  ProjectTaskLabel,
  UpdateTaskLabelPayload,
} from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchProjectLabels(projectId: string): Promise<ProjectTaskLabel[]> {
  if (isMockMode()) return [];
  try {
    const res = await GET(API.TASKS.LABELS(projectId), getHeaders());
    const list = (res.data?.data ?? res.data ?? []) as ProjectTaskLabel[];
    return Array.isArray(list) ? list : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectLabels(projectId))) ?? [];
    }
    throw error;
  }
}

export async function fetchProjectLabel(
  projectId: string,
  labelId: string,
): Promise<ProjectTaskLabel | null> {
  if (isMockMode()) return null;
  try {
    const res = await GET(API.TASKS.LABEL(projectId, labelId), getHeaders());
    return (res.data ?? null) as ProjectTaskLabel | null;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectLabel(projectId, labelId))) ?? null;
    }
    if (error?.response?.status === 404) return null;
    throw error;
  }
}

export async function createProjectLabel(
  projectId: string,
  payload: CreateTaskLabelPayload,
): Promise<ProjectTaskLabel> {
  if (isMockMode()) throw new Error("Mock mode cannot create labels");
  try {
    const res = await POST(API.TASKS.LABELS(projectId), getHeaders(), payload);
    return res.data as ProjectTaskLabel;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => createProjectLabel(projectId, payload))) as ProjectTaskLabel;
    }
    throw error;
  }
}

export async function updateProjectLabel(
  projectId: string,
  labelId: string,
  payload: UpdateTaskLabelPayload,
): Promise<ProjectTaskLabel> {
  if (isMockMode()) throw new Error("Mock mode cannot update labels");
  try {
    const res = await PATCH(API.TASKS.LABEL(projectId, labelId), getHeaders(), payload);
    return res.data as ProjectTaskLabel;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateProjectLabel(projectId, labelId, payload),
      )) as ProjectTaskLabel;
    }
    throw error;
  }
}

export async function deleteProjectLabel(projectId: string, labelId: string): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.LABEL(projectId, labelId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteProjectLabel(projectId, labelId));
      return;
    }
    throw error;
  }
}

export async function assignLabelToTask(
  projectId: string,
  taskId: string,
  labelId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await POST(API.TASKS.ASSIGN_LABEL(projectId, taskId, labelId), getHeaders(), {});
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => assignLabelToTask(projectId, taskId, labelId));
      return;
    }
    throw error;
  }
}

export async function removeLabelFromTask(
  projectId: string,
  taskId: string,
  labelId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.ASSIGN_LABEL(projectId, taskId, labelId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => removeLabelFromTask(projectId, taskId, labelId));
      return;
    }
    throw error;
  }
}
