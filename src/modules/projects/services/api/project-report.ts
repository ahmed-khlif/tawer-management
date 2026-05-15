import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  ProjectProductivityMetrics,
  ProjectReportOverview,
  ProjectTeamWorkload,
} from "@/modules/projects/types/project-insights";
import {
  castProjectProductivityMetrics,
  castProjectReportOverview,
  castProjectTeamWorkload,
} from "@/modules/projects/types/cast-project-insights";

const EMPTY_REPORT_OVERVIEW: ProjectReportOverview = {
  projectId: "",
  totalTasks: 0,
  completedTasks: 0,
  openTasks: 0,
  overdueTasks: 0,
  stuckTasks: 0,
  completionPercent: 0,
  activeSprints: 0,
  sprintStatusBreakdown: {
    pending: 0,
    running: 0,
  },
  milestones: {
    total: 0,
    completed: 0,
    completionPercent: 0,
  },
};

const EMPTY_PRODUCTIVITY: ProjectProductivityMetrics = {
  projectId: "",
  projectCompletionPercent: 0,
  teamAverageProductivityScore: 0,
  members: [],
};

const EMPTY_WORKLOAD: ProjectTeamWorkload = {
  projectId: "",
  totalAssignedTasks: 0,
  totalOpenTasks: 0,
  totalCompletedTasks: 0,
  totalLoggedHours: 0,
  members: [],
};

async function getWithAuth<T>(
  url: string,
  fallback: T,
  retry: () => Promise<T>,
): Promise<T> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(url, headers);
    return response.data as T;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(retry)) ?? fallback;
    }

    throw error;
  }
}

export async function fetchProjectReportOverview(
  projectId: string,
): Promise<ProjectReportOverview> {
  if (isMockMode()) {
    return { ...EMPTY_REPORT_OVERVIEW, projectId };
  }

  return getWithAuth(
    API.PROJECTS.REPORT_OVERVIEW(projectId),
    EMPTY_REPORT_OVERVIEW,
    () => fetchProjectReportOverview(projectId),
  ).then(castProjectReportOverview);
}

export async function fetchProjectProductivityMetrics(
  projectId: string,
): Promise<ProjectProductivityMetrics> {
  if (isMockMode()) {
    return { ...EMPTY_PRODUCTIVITY, projectId };
  }

  return getWithAuth(
    API.PROJECTS.PRODUCTIVITY(projectId),
    EMPTY_PRODUCTIVITY,
    () => fetchProjectProductivityMetrics(projectId),
  ).then(castProjectProductivityMetrics);
}

export async function fetchProjectTeamWorkload(
  projectId: string,
): Promise<ProjectTeamWorkload> {
  if (isMockMode()) {
    return { ...EMPTY_WORKLOAD, projectId };
  }

  return getWithAuth(
    API.PROJECTS.TEAM_WORKLOAD(projectId),
    EMPTY_WORKLOAD,
    () => fetchProjectTeamWorkload(projectId),
  ).then(castProjectTeamWorkload);
}
