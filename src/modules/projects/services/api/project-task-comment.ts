import { POST, PATCH, DELETE } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export async function addProjectTaskComment(
  projectId: string,
  taskId: string,
  content: string,
  mentions: string[] = [],
): Promise<void> {
  try {
    await POST(API.TASKS.COMMENTS(projectId, taskId), getHeaders(), {
      content,
      ...(mentions.length
        ? { mentions: mentions.map((userId) => ({ userId })) }
        : {}),
    });
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        addProjectTaskComment(projectId, taskId, content, mentions),
      );
    }
    throw error;
  }
}

export async function updateProjectTaskComment(
  projectId: string,
  taskId: string,
  commentId: string,
  content: string,
): Promise<void> {
  try {
    await PATCH(
      API.TASKS.COMMENT(projectId, taskId, commentId),
      getHeaders(),
      { content },
    );
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        updateProjectTaskComment(projectId, taskId, commentId, content),
      );
    }
    throw error;
  }
}

export async function deleteProjectTaskComment(
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<void> {
  try {
    await DELETE(API.TASKS.COMMENT(projectId, taskId, commentId), getHeaders());
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        deleteProjectTaskComment(projectId, taskId, commentId),
      );
    }
    throw error;
  }
}

export async function likeProjectTaskComment(
  projectId: string,
  taskId: string,
  commentId: string,
): Promise<void> {
  try {
    await POST(API.TASKS.LIKE_COMMENT(projectId, taskId, commentId), getHeaders(), {});
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() =>
        likeProjectTaskComment(projectId, taskId, commentId),
      );
    }
    throw error;
  }
}
