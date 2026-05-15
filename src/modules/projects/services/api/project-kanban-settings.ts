import { GET, PATCH } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  ProjectKanbanSettingsResponse,
  UpdateProjectKanbanSettingsDto,
} from "@/modules/projects/types/project-insights";

const EMPTY_KANBAN_SETTINGS: ProjectKanbanSettingsResponse = {
  projectId: "",
  kanbanSettings: null,
};

export async function fetchProjectKanbanSettings(
  projectId: string,
): Promise<ProjectKanbanSettingsResponse> {
  if (isMockMode()) {
    return { ...EMPTY_KANBAN_SETTINGS, projectId };
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(API.PROJECTS.KANBAN_SETTINGS(projectId), headers);
    return response.data as ProjectKanbanSettingsResponse;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => fetchProjectKanbanSettings(projectId))) ??
        EMPTY_KANBAN_SETTINGS
      );
    }

    throw error;
  }
}

export async function updateProjectKanbanSettings(
  projectId: string,
  data: UpdateProjectKanbanSettingsDto,
): Promise<ProjectKanbanSettingsResponse> {
  if (isMockMode()) {
    return { projectId, kanbanSettings: data.settings ?? null };
  }

  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await PATCH(
      API.PROJECTS.KANBAN_SETTINGS(projectId),
      headers,
      data,
    );
    return response.data as ProjectKanbanSettingsResponse;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() =>
          updateProjectKanbanSettings(projectId, data),
        )) ?? EMPTY_KANBAN_SETTINGS
      );
    }

    throw error;
  }
}
