import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { castProjectDashboardSnapshot } from "@/modules/projects/types/cast-project-insights";
import { ProjectDashboardSnapshot } from "@/modules/projects/types/project-insights";

const EMPTY_DASHBOARD_SNAPSHOT: ProjectDashboardSnapshot = {
  projectId: "",
  projectName: "",
  health: {
    score: 0,
    status: "WATCH",
    summary: "",
    drivers: [],
  },
  delivery: {
    totalTasks: 0,
    completedTasks: 0,
    openTasks: 0,
    overdueTasks: 0,
    blockedTasks: 0,
    stuckTasks: 0,
    completionPercent: 0,
    summary: "",
    activeSprintLabel: null,
    milestonePressureLabel: null,
  },
  capacity: {
    activeSprints: 0,
    totalCapacityPoints: 0,
    totalCommittedPoints: 0,
    totalRemainingPoints: 0,
    overloadedMembers: 0,
    underutilizedMembers: 0,
    riskLevel: "LOW",
    rankedMembers: [],
  },
  ai: {
    estimateQuality: {
      completedTasksWithEstimates: 0,
      estimateMaeHours: 0,
      onEstimateRatePercent: 0,
      qualityStatus: "WATCH",
      summary: "",
    },
    anomalies: [],
    actions: [],
  },
  trends: {
    delivery: [],
  },
};

export async function fetchProjectDashboardSnapshot(
  projectId: string,
): Promise<ProjectDashboardSnapshot> {
  if (isMockMode()) {
    return { ...EMPTY_DASHBOARD_SNAPSHOT, projectId };
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(API.PROJECTS.REPORT_SNAPSHOT(projectId), headers);
    return castProjectDashboardSnapshot(
      response.data as ProjectDashboardSnapshot,
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectDashboardSnapshot(projectId))) ??
        EMPTY_DASHBOARD_SNAPSHOT
      );
    }

    throw error;
  }
}
