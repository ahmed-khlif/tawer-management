import { POST, PATCH } from "@/lib/http-methods";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export interface ProjectTaskPayload {
  title?: string;
  description?: string | null;
  type?: string;
  status?: string;
  priority?: string;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  dueDate?: string | null;
  assigneeId?: string | null;
  milestoneId?: string | null;
  sprintId?: string | null;
  parentTaskId?: string | null;
  progressPercent?: number | null;
  displayOrder?: number;
  isFavorite?: boolean;
  archived?: boolean;
  aiSuggestAssignee?: boolean;
  aiSuggestEstimate?: boolean;
  aiSuggestBlockerRisk?: boolean;
}

interface Params {
  task: ProjectTaskPayload;
  id?: string;
  projectId: string;
  attachments?: File[];
  deletedAttachments?: string;
}

const UUID_FIELDS = new Set([
  "assigneeId",
  "milestoneId",
  "sprintId",
  "parentTaskId",
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Drop noisy values that would 400 the backend's class-validator pipe:
 * - empty strings on UUID fields (must be a real UUID or absent)
 * - non-ISO date strings (we keep undefined; clearing a date is `null`)
 * - undefined fields are dropped so they don't appear in JSON
 */
function sanitizeTaskPayload(input: ProjectTaskPayload): ProjectTaskPayload {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    if (UUID_FIELDS.has(key)) {
      if (value === "" || value === null) {
        // Backend treats `null` as "clear this field". An empty string fails
        // @IsUUID(); drop it instead. Pass `null` explicitly when you want to
        // clear an existing reference.
        if (value === null) out[key] = null;
        continue;
      }
      if (typeof value === "string" && !UUID_RE.test(value)) {
        // Bad UUID — drop rather than 400.
        continue;
      }
    }

    if (key === "dueDate") {
      if (value === "" || value === null) {
        // Empty string fails @IsDateString. Drop it; pass `null` explicitly to
        // clear an existing dueDate.
        if (value === null) out[key] = null;
        continue;
      }
    }

    out[key] = value;
  }
  return out as ProjectTaskPayload;
}

export default async function uploadProjectTask({ task, id, projectId, attachments, deletedAttachments }: Params) {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const cleanTask = sanitizeTaskPayload(task);

  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    Object.entries(cleanTask).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    attachments.forEach((file) => formData.append("attachments", file));
    if (deletedAttachments) formData.append("deletedAttachments", deletedAttachments);

    try {
      const res = id
        ? await PATCH(`/projects/${projectId}/tasks/${id}`, { ...headers, "Content-Type": "multipart/form-data" }, formData)
        : await POST(`/projects/${projectId}/tasks`, { ...headers, "Content-Type": "multipart/form-data" }, formData);
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return await refreshToken(() => uploadProjectTask({ task, id, projectId, attachments, deletedAttachments }));
      }
      throw error;
    }
  }

  try {
    const res = id
      ? await PATCH(`/projects/${projectId}/tasks/${id}`, headers, cleanTask)
      : await POST(`/projects/${projectId}/tasks`, headers, cleanTask);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return await refreshToken(() => uploadProjectTask({ task, id, projectId }));
    }
    throw error;
  }
}
