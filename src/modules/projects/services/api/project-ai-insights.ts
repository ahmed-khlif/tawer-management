import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { ProjectAiInsights } from "@/modules/projects/types/project-insights";
import { castProjectAiInsights } from "@/modules/projects/types/cast-project-insights";

const EMPTY_AI_INSIGHTS: ProjectAiInsights = {
  projectId: "",
  metrics: {
    completedTasksWithEstimates: 0,
    estimateMaeHours: 0,
    onEstimateRatePercent: 0,
    blockedTasks: 0,
  },
  anomalies: [],
  recommendations: [],
};

export async function fetchProjectAiInsights(
  projectId: string,
): Promise<ProjectAiInsights> {
  if (isMockMode()) {
    return { ...EMPTY_AI_INSIGHTS, projectId };
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(API.PROJECTS.AI_INSIGHTS(projectId), headers);
    return castProjectAiInsights(response.data as ProjectAiInsights);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectAiInsights(projectId))) ??
        EMPTY_AI_INSIGHTS
      );
    }

    throw error;
  }
}
