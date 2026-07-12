import { DELETE } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export async function deleteSprint(projectId: string, sprintId: string): Promise<void> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    await DELETE(`/projects/sprints/${sprintId}`, headers);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => deleteSprint(projectId, sprintId));
      if (retried == null) throw error;
      return;
    }
    throw error;
  }
}
