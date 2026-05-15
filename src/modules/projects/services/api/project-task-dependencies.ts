import { POST, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  AddDependencyPayload,
  ProjectTaskDependency,
} from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function addTaskDependency(
  projectId: string,
  taskId: string,
  payload: AddDependencyPayload,
): Promise<ProjectTaskDependency> {
  if (isMockMode()) throw new Error("Mock mode cannot add dependencies");
  try {
    const res = await POST(API.TASKS.DEPENDENCIES(projectId, taskId), getHeaders(), payload);
    return res.data as ProjectTaskDependency;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        addTaskDependency(projectId, taskId, payload),
      )) as ProjectTaskDependency;
    }
    throw error;
  }
}

export async function removeTaskDependency(
  projectId: string,
  taskId: string,
  dependencyId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.DEPENDENCY(projectId, taskId, dependencyId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => removeTaskDependency(projectId, taskId, dependencyId));
      return;
    }
    throw error;
  }
}
