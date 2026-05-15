import { DELETE, GET, PATCH, POST } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  CreateEpicDto,
  Epic,
  EpicList,
  EpicQueryParams,
  UpdateEpicDto,
} from "@/modules/projects/types/project-epics";

function buildQuery(params?: EpicQueryParams) {
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

const EMPTY_EPICS: EpicList = {
  data: [],
  pagination: { records: 0, currentPage: 1, totalPages: 0, perPage: 10 },
};

export async function fetchProjectEpics(
  projectId: string,
  params?: EpicQueryParams,
): Promise<EpicList> {
  if (isMockMode()) return EMPTY_EPICS;

  const query = buildQuery(params);

  try {
    const response = await GET(
      query
        ? `${API.EPICS.LIST(projectId)}?${query}`
        : API.EPICS.LIST(projectId),
      getHeaders(),
    );
    return response.data as EpicList;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectEpics(projectId, params))) ?? EMPTY_EPICS;
    }
    throw error;
  }
}

export async function fetchProjectEpic(
  projectId: string,
  epicId: string,
): Promise<Epic | null> {
  if (isMockMode()) return null;

  try {
    const response = await GET(API.EPICS.DETAIL(projectId, epicId), getHeaders());
    return response.data as Epic;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectEpic(projectId, epicId))) ?? null;
    }
    throw error;
  }
}

export async function createProjectEpic(
  projectId: string,
  data: CreateEpicDto,
): Promise<Epic> {
  if (isMockMode()) {
    return {
      id: crypto.randomUUID(),
      projectId,
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      createdAt: new Date().toISOString(),
      tasks: [],
      totalTasks: 0,
      doneTasks: 0,
      progress: 0,
    };
  }

  try {
    const response = await POST(API.EPICS.CREATE(projectId), getHeaders(), data);
    return response.data as Epic;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => createProjectEpic(projectId, data))) as Epic;
    }
    throw error;
  }
}

export async function updateProjectEpic(
  projectId: string,
  epicId: string,
  data: UpdateEpicDto,
): Promise<Epic> {
  if (isMockMode()) {
    return {
      id: epicId,
      projectId,
      name: data.name ?? "Updated Epic",
      description: data.description ?? null,
      color: data.color ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      createdAt: new Date().toISOString(),
      tasks: [],
      totalTasks: 0,
      doneTasks: 0,
      progress: 0,
    };
  }

  try {
    const response = await PATCH(API.EPICS.UPDATE(projectId, epicId), getHeaders(), data);
    return response.data as Epic;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() =>
        updateProjectEpic(projectId, epicId, data),
      )) as Epic;
    }
    throw error;
  }
}

export async function deleteProjectEpic(projectId: string, epicId: string): Promise<void> {
  if (isMockMode()) return;

  try {
    await DELETE(API.EPICS.DELETE(projectId, epicId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteProjectEpic(projectId, epicId));
      return;
    }
    throw error;
  }
}
