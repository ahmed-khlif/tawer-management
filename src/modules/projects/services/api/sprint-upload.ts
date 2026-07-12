import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  CreateSprintPayload,
  CreatedSprintAiResponse,
  UpdateSprintPayload,
} from "@/modules/projects/types/project-sprints";

export async function uploadSprint(
  projectId: string,
  data: CreateSprintPayload | UpdateSprintPayload,
  id?: string,
): Promise<CreatedSprintAiResponse | undefined> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    if (id) {
      await PATCH(`/projects/sprints/${id}`, headers, data);
      return undefined;
    }
    const res = await POST(`/projects/${projectId}/sprints`, headers, data);
    return res?.data as CreatedSprintAiResponse | undefined;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => uploadSprint(projectId, data, id));
      if (retried == null) throw error;
      return retried;
    }
    throw error;
  }
}
