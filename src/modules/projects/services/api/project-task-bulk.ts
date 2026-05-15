import { PATCH } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { BulkUpdateStatusPayload } from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function bulkUpdateTaskStatus(
  projectId: string,
  payload: BulkUpdateStatusPayload,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await PATCH(API.TASKS.BULK_STATUS(projectId), getHeaders(), payload);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => bulkUpdateTaskStatus(projectId, payload));
      return;
    }
    throw error;
  }
}
