import { GET, PATCH } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import {
  MoveTaskInKanbanPayload,
  ProjectTaskType,
} from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export interface ProjectKanbanColumn {
  statusId?: string;
  status?: string;
  name: string;
  color?: string | null;
  category?: string;
  order: number;
  wipLimit?: number | null;
  tasks: ProjectTaskType[];
}

export interface ProjectKanban {
  columns: ProjectKanbanColumn[];
}

export async function fetchProjectKanban(projectId: string): Promise<ProjectKanban> {
  if (isMockMode()) return { columns: [] };
  try {
    const res = await GET(API.TASKS.KANBAN(projectId), getHeaders());
    const data = res.data as ProjectKanban | ProjectKanbanColumn[];
    if (Array.isArray(data)) {
      return {
        columns: data.map((column) => ({
          ...column,
          tasks: Array.isArray(column.tasks)
            ? column.tasks.map((task) => castProjectTaskToFrontend(task as any))
            : [],
        })),
      };
    }
    return {
      ...data,
      columns: Array.isArray(data.columns)
        ? data.columns.map((column) => ({
            ...column,
            tasks: Array.isArray(column.tasks)
              ? column.tasks.map((task) => castProjectTaskToFrontend(task as any))
              : [],
          }))
        : [],
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(() => fetchProjectKanban(projectId))) ?? { columns: [] };
    }
    throw error;
  }
}

export async function moveTaskInKanban(
  projectId: string,
  payload: MoveTaskInKanbanPayload,
): Promise<void> {
  if (isMockMode()) return;
  try {
    await PATCH(API.TASKS.MOVE_IN_KANBAN(projectId), getHeaders(), payload);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      await refreshToken(() => moveTaskInKanban(projectId, payload));
      return;
    }
    throw error;
  }
}
