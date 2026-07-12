import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  ProjectTaskType,
  ProjectTaskInResponseType,
  MyTasksList,
} from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

export interface ProjectTasksParams {
  projectId: string;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: string;
  sprintId?: string;
  milestoneId?: string;
  epicId?: string | null;
  dueDateFrom?: string;
  dueDateTo?: string;
  isFavorite?: boolean;
  archived?: boolean;
  labelName?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ProjectTasksList {
  data: ProjectTaskType[];
  pagination: MyTasksList["pagination"];
}

function buildQuery(params: ProjectTasksParams): string {
  const query = new URLSearchParams();
  if (params.status)       query.append("status", params.status);
  if (params.priority)     query.append("priority", params.priority);
  if (params.type)         query.append("type", params.type);
  if (params.assigneeId)   query.append("assigneeId", params.assigneeId);
  if (params.sprintId)     query.append("sprintId", params.sprintId);
  if (params.milestoneId)  query.append("milestoneId", params.milestoneId);
  if (params.epicId !== undefined) query.append("epicId", params.epicId ?? "null");
  if (params.dueDateFrom)  query.append("dueDateFrom", params.dueDateFrom);
  if (params.dueDateTo)    query.append("dueDateTo", params.dueDateTo);
  if (typeof params.isFavorite === "boolean") query.append("isFavorite", String(params.isFavorite));
  if (typeof params.archived === "boolean")   query.append("archived", String(params.archived));
  if (params.labelName)    query.append("labelName", params.labelName);
  if (params.sortBy)       query.append("sortBy", params.sortBy);
  if (params.page)         query.append("page", String(params.page));
  if (params.limit)        query.append("limit", String(params.limit));
  return query.toString();
}

/**
 * Fetch the paginated task list for a project.
 * Backend returns `TaskListDto` ({ data, pagination }).
 * Errors are propagated so React Query can show error UI.
 */
export async function retrieveProjectTasksPaginated(
  params: ProjectTasksParams,
): Promise<ProjectTasksList> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(
      `/projects/${params.projectId}/tasks?${buildQuery(params)}`,
      headers,
    );
    const payload = res.data as {
      data: ProjectTaskInResponseType[];
      pagination: ProjectTasksList["pagination"];
    };
    return {
      data: (payload?.data ?? []).map(castProjectTaskToFrontend),
      pagination: payload?.pagination ?? {
        records: 0,
        currentPage: 1,
        totalPages: 1,
        perPage: params.limit ?? 10,
      },
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => retrieveProjectTasksPaginated(params));
      if (retried != null) return retried;
    }
    throw error;
  }
}

/**
 * Backwards-compatible flat-array helper (returns just `.data`).
 * Defaults to a 100-item page so legacy callers see most tasks; new
 * callers should prefer `retrieveProjectTasksPaginated`.
 */
export default async function retrieveProjectTasks(
  params: ProjectTasksParams,
): Promise<ProjectTaskType[]> {
  const result = await retrieveProjectTasksPaginated({
    ...params,
    limit: params.limit ?? 100,
  });
  return result.data;
}

/**
 * Fetch the full TaskResponseDto (description, comments, dependencies,
 * labels, time-entries, …) for a single task. The list endpoint returns
 * only `TaskSummaryDto`, so callers that open a task detail sheet need
 * this to render the full record.
 */
export async function retrieveProjectTaskById(
  projectId: string,
  taskId: string,
): Promise<ProjectTaskType | null> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(API.TASKS.DETAIL(projectId, taskId), headers);
    if (!res?.data) return null;
    return castProjectTaskToFrontend(res.data as ProjectTaskInResponseType);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => retrieveProjectTaskById(projectId, taskId));
      if (retried != null) return retried;
    }
    if (error?.response?.status === 404) return null;
    throw error;
  }
}
