import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  CreateProjectPayload,
  CreatedProjectAiResponse,
  UpdateProjectPayload,
} from "@/modules/projects/types/projects";

export async function uploadProject(
  data: CreateProjectPayload | UpdateProjectPayload,
  id?: string,
): Promise<CreatedProjectAiResponse | undefined> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    if (id) {
      await PATCH(`/projects/${id}`, headers, data);
      return undefined;
    }
    const res = await POST(`/projects/register`, headers, data);
    return res?.data as CreatedProjectAiResponse | undefined;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => uploadProject(data, id));
    }
    throw error;
  }
}
