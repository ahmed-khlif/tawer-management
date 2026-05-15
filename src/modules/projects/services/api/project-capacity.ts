import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { ProjectCapacity } from "@/modules/projects/types/project-insights";
import { castProjectCapacity } from "@/modules/projects/types/cast-project-insights";

const EMPTY_PROJECT_CAPACITY: ProjectCapacity = {
  projectId: "",
  activeSprints: 0,
  totalCapacityPoints: 0,
  totalCommittedPoints: 0,
  totalRemainingPoints: 0,
  unassignedCommittedPoints: 0,
  isOverCapacity: false,
  riskLevel: "LOW",
  members: [],
};

export async function fetchProjectCapacity(
  projectId: string,
): Promise<ProjectCapacity> {
  if (isMockMode()) {
    return { ...EMPTY_PROJECT_CAPACITY, projectId };
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(API.PROJECTS.CAPACITY(projectId), headers);
    return castProjectCapacity(response.data as ProjectCapacity);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectCapacity(projectId))) ??
        EMPTY_PROJECT_CAPACITY
      );
    }

    throw error;
  }
}
