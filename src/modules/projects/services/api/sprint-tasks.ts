import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { SprintTaskSummaryInResponse } from "@/modules/projects/types/project-sprints";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchTasksInSprint(
  projectId: string,
  sprintId: string,
): Promise<SprintTaskSummaryInResponse[]> {
  if (isMockMode()) return [];
  try {
    const response = await GET(API.TASKS.TASKS_IN_SPRINT(projectId, sprintId), getHeaders());
    const list = (response.data?.data ?? response.data ?? []) as SprintTaskSummaryInResponse[];
    return Array.isArray(list) ? list : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchTasksInSprint(projectId, sprintId))) ?? []
      );
    }
    throw error;
  }
}
