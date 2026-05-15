import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  EmployeeAnalyticsSummary,
  EmployeeProductivityMetrics,
  ExecutiveAnalyticsOverview,
} from "@/modules/analytics/types";
import {
  castEmployeeAnalyticsSummary,
  castEmployeeProductivityMetrics,
  castExecutiveAnalyticsOverview,
} from "@/modules/analytics/types/cast-analytics";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

const EMPTY_OVERVIEW: ExecutiveAnalyticsOverview = {
  totalProjects: 0,
  totalTasks: 0,
  openTasks: 0,
  completedTasks: 0,
  activeSprints: 0,
  totalProjectMembers: 0,
};

export async function fetchExecutiveAnalyticsOverview(): Promise<ExecutiveAnalyticsOverview> {
  if (isMockMode()) return EMPTY_OVERVIEW;

  try {
    const response = await GET(API.ANALYTICS.OVERVIEW(), getHeaders());
    return castExecutiveAnalyticsOverview(response.data as ExecutiveAnalyticsOverview);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(fetchExecutiveAnalyticsOverview)) ?? EMPTY_OVERVIEW;
    }
    throw error;
  }
}

export async function fetchEmployeeAnalyticsSummary(
  userId: string,
): Promise<EmployeeAnalyticsSummary | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(API.ANALYTICS.EMPLOYEE_SUMMARY(userId), getHeaders());
    return castEmployeeAnalyticsSummary(response.data as EmployeeAnalyticsSummary);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchEmployeeAnalyticsSummary(userId))) ?? null
      );
    }
    throw error;
  }
}

export async function fetchEmployeeProductivityMetrics(
  userId: string,
): Promise<EmployeeProductivityMetrics | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(API.ANALYTICS.EMPLOYEE_METRICS(userId), getHeaders());
    return castEmployeeProductivityMetrics(response.data as EmployeeProductivityMetrics);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchEmployeeProductivityMetrics(userId))) ?? null
      );
    }
    throw error;
  }
}
