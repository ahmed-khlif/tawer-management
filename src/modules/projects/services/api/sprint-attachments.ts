import { GET, PATCH, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { SprintAttachmentInResponse } from "@/modules/projects/types/project-sprints";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function listSprintAttachments(
  projectId: string,
  sprintId: string,
): Promise<SprintAttachmentInResponse[]> {
  if (isMockMode()) return [];
  try {
    const response = await GET(API.SPRINTS.ATTACHMENTS(projectId, sprintId), getHeaders());
    const list = (response.data?.data ?? response.data ?? []) as SprintAttachmentInResponse[];
    return Array.isArray(list) ? list : [];
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (
        (await refreshToken(() => listSprintAttachments(projectId, sprintId))) ?? []
      );
    }
    throw error;
  }
}

export async function uploadSprintAttachments(
  projectId: string,
  sprintId: string,
  files: File[],
): Promise<void> {
  if (isMockMode()) return;
  const formData = new FormData();
  files.forEach((file) => formData.append("attachments", file));
  const headers = {
    ...getHeaders(),
    "Content-Type": "multipart/form-data",
  };
  try {
    await PATCH(`/projects/sprints/${sprintId}`, headers, formData);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => uploadSprintAttachments(projectId, sprintId, files));
      return;
    }
    throw error;
  }
}

export async function deleteSprintAttachment(
  projectId: string,
  sprintId: string,
  attachmentId: string,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await DELETE(API.SPRINTS.ATTACHMENT(projectId, sprintId, attachmentId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => deleteSprintAttachment(projectId, sprintId, attachmentId));
      return;
    }
    throw error;
  }
}
