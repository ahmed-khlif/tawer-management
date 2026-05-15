import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { SprintBurndown } from "@/modules/projects/types/project-sprints";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchSprintBurndown(sprintId: string): Promise<SprintBurndown | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(API.SPRINTS.BURNDOWN(sprintId), getHeaders());
    return response.data as SprintBurndown;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchSprintBurndown(sprintId))) ?? null;
    }
    throw error;
  }
}
