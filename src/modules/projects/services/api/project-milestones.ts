import { DELETE, GET, PATCH, POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  CreateMilestoneDto,
  GanttChart,
  Milestone,
  MilestoneList,
  MilestoneQueryParams,
  UpdateMilestoneDto,
} from "@/modules/projects/types/project-milestones";

function buildQuery(params?: MilestoneQueryParams) {
  const query = new URLSearchParams();
  if (!params) return query.toString();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

const EMPTY_MILESTONES: MilestoneList = {
  data: [],
  pagination: { records: 0, currentPage: 1, totalPages: 0, perPage: 10 },
};

const EMPTY_GANTT: GanttChart = {
  milestones: [],
  epics: [],
  sprints: [],
  tasks: [],
};

export async function fetchProjectMilestones(
  projectId: string,
  params?: MilestoneQueryParams,
): Promise<MilestoneList> {
  if (isMockMode()) return EMPTY_MILESTONES;

  const query = buildQuery(params);

  try {
    const response = await GET(
      query
        ? `${API.MILESTONES.LIST(projectId)}?${query}`
        : API.MILESTONES.LIST(projectId),
      getHeaders(),
    );
    return response.data as MilestoneList;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectMilestones(projectId, params))) ??
        EMPTY_MILESTONES
      );
    }
    throw error;
  }
}

export async function fetchProjectMilestone(
  projectId: string,
  milestoneId: string,
): Promise<Milestone | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(
      API.MILESTONES.DETAIL(projectId, milestoneId),
      getHeaders(),
    );
    return response.data as Milestone;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectMilestone(projectId, milestoneId))) ??
        null
      );
    }
    throw error;
  }
}

export async function createProjectMilestone(
  projectId: string,
  data: CreateMilestoneDto,
): Promise<Milestone> {
  if (isMockMode()) {
    return {
      id: crypto.randomUUID(),
      projectId,
      name: data.name,
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      totalTasks: 0,
      doneTasks: 0,
      progress: 0,
    };
  }

  try {
    const response = await POST(API.MILESTONES.CREATE(projectId), getHeaders(), data);
    return response.data as Milestone;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        createProjectMilestone(projectId, data),
      )) as Milestone;
    }
    throw error;
  }
}

export async function updateProjectMilestone(
  projectId: string,
  milestoneId: string,
  data: UpdateMilestoneDto,
): Promise<Milestone> {
  if (isMockMode()) {
    return {
      id: milestoneId,
      projectId,
      name: data.name ?? "Updated milestone",
      description: data.description ?? null,
      dueDate: data.dueDate ?? null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      totalTasks: 0,
      doneTasks: 0,
      progress: 0,
    };
  }

  try {
    const response = await PATCH(
      API.MILESTONES.UPDATE(projectId, milestoneId),
      getHeaders(),
      data,
    );
    return response.data as Milestone;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateProjectMilestone(projectId, milestoneId, data),
      )) as Milestone;
    }
    throw error;
  }
}

export async function completeProjectMilestone(
  projectId: string,
  milestoneId: string,
): Promise<Milestone> {
  if (isMockMode()) {
    return {
      id: milestoneId,
      projectId,
      name: "Completed milestone",
      description: null,
      dueDate: null,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      totalTasks: 0,
      doneTasks: 0,
      progress: 100,
    };
  }

  try {
    const response = await PATCH(
      API.MILESTONES.COMPLETE(projectId, milestoneId),
      getHeaders(),
      {},
    );
    return response.data as Milestone;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        completeProjectMilestone(projectId, milestoneId),
      )) as Milestone;
    }
    throw error;
  }
}

export async function deleteProjectMilestone(
  projectId: string,
  milestoneId: string,
): Promise<void> {
  if (isMockMode()) return;

  try {
    await DELETE(API.MILESTONES.DELETE(projectId, milestoneId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteProjectMilestone(projectId, milestoneId));
      return;
    }
    throw error;
  }
}

export async function fetchProjectMilestoneGantt(projectId: string): Promise<GanttChart> {
  if (isMockMode()) return EMPTY_GANTT;

  try {
    const response = await GET(API.MILESTONES.GANTT(projectId), getHeaders());
    return response.data as GanttChart;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectMilestoneGantt(projectId))) ?? EMPTY_GANTT
      );
    }
    throw error;
  }
}
