import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { SprintAiCapacitySignal } from "@/modules/projects/types/project-sprints";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchSprintAiCapacity(
  projectId: string,
  sprintId: string,
): Promise<SprintAiCapacitySignal | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(
      API.SPRINTS.AI_CAPACITY_SIGNAL(projectId, sprintId),
      getHeaders(),
    );
    return response.data as SprintAiCapacitySignal;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchSprintAiCapacity(projectId, sprintId))) ?? null
      );
    }
    throw error;
  }
}
