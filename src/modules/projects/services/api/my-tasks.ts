import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  MyTaskQueryParams,
  MyTasksList,
  ProjectTaskInResponseType,
  UserWorkloadSummary,
} from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

const EMPTY_LIST: MyTasksList = {
  data: [],
  pagination: { records: 0, currentPage: 1, totalPages: 0, perPage: 10 },
};

const EMPTY_WORKLOAD: UserWorkloadSummary = {
  userId: "",
  activeProjects: 0,
  totalAssignedTasks: 0,
  openTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  dueNext7Days: 0,
  totalStoryPoints: 0,
  totalEstimatedHours: 0,
  totalActualHours: 0,
  totalLoggedHours: 0,
  byStatus: {},
  byPriority: {},
};

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

function buildQuery(params?: MyTaskQueryParams) {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchMyTasks(params?: MyTaskQueryParams): Promise<MyTasksList> {
  if (isMockMode()) return EMPTY_LIST;

  try {
    const response = await GET(
      `${API.TASKS.MY_TASKS()}${buildQuery(params)}`,
      getHeaders(),
    );
    const data = response.data as { data?: ProjectTaskInResponseType[]; pagination?: MyTasksList["pagination"] };
    return {
      data: Array.isArray(data?.data)
        ? data.data.map(castProjectTaskToFrontend)
        : [],
      pagination: data?.pagination ?? EMPTY_LIST.pagination,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchMyTasks(params))) ?? EMPTY_LIST;
    }
    throw error;
  }
}

export async function fetchMyTasksInProject(
  projectId: string,
  params?: MyTaskQueryParams,
): Promise<MyTasksList> {
  if (isMockMode()) return EMPTY_LIST;

  try {
    const response = await GET(
      `${API.TASKS.MY_PROJECT_TASKS(projectId)}${buildQuery(params)}`,
      getHeaders(),
    );
    const data = response.data as { data?: ProjectTaskInResponseType[]; pagination?: MyTasksList["pagination"] };
    return {
      data: Array.isArray(data?.data)
        ? data.data.map(castProjectTaskToFrontend)
        : [],
      pagination: data?.pagination ?? EMPTY_LIST.pagination,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchMyTasksInProject(projectId, params))) ?? EMPTY_LIST;
    }
    throw error;
  }
}

export async function fetchMyWorkloadSummary(): Promise<UserWorkloadSummary> {
  if (isMockMode()) return EMPTY_WORKLOAD;

  try {
    const response = await GET(API.TASKS.MY_WORKLOAD_SUMMARY(), getHeaders());
    return response.data as UserWorkloadSummary;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(fetchMyWorkloadSummary)) ?? EMPTY_WORKLOAD;
    }
    throw error;
  }
}
