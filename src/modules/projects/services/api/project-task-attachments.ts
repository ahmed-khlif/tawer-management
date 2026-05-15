import { GET, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { ProjectTaskAttachment } from "@/modules/projects/types/project-tasks";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function fetchTaskAttachments(
  projectId: string,
  taskId: string,
): Promise<ProjectTaskAttachment[]> {
  if (isMockMode()) return [];
  try {
    const res = await GET(API.TASKS.ATTACHMENTS(projectId, taskId), getHeaders());
    const list = (res.data?.data ?? res.data ?? []) as ProjectTaskAttachment[];
    return Array.isArray(list) ? list : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchTaskAttachments(projectId, taskId))) ?? [];
    }
    throw error;
  }
}

export async function deleteTaskAttachment(
  projectId: string,
  taskId: string,
  attachmentId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.TASKS.ATTACHMENT(projectId, taskId, attachmentId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteTaskAttachment(projectId, taskId, attachmentId));
      return;
    }
    throw error;
  }
}
