import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { castProjectTaskToFrontend } from "@/modules/projects/types/cast-project-task";
import { USE_MOCK } from "@/lib/mock-config";
import { fetchMyTasks, fetchMyTasksInProject } from "@/modules/projects/services/api/my-tasks";
import mockData from "../../mock_data/mock.json";

const MOCK_ASSIGNEE_ID = "mock-user-id";

export interface AssignedProjectTasksParams {
  search?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  type?: string;
  page?: number;
  limit?: number;
}

function mockRetrieveAssignedProjectTasks(params: AssignedProjectTasksParams): ProjectTaskType[] {
  let tasks = [] as Array<Parameters<typeof castProjectTaskToFrontend>[0]>;

  for (const project of mockData.projects) {
    if (params.projectId && project.id !== params.projectId) continue;
    const projectTasks = (project.tasks as unknown as typeof tasks) ?? [];
    tasks = tasks.concat(projectTasks.filter((t) => t.assigneeId === MOCK_ASSIGNEE_ID));
  }

  if (params.status)   tasks = tasks.filter((t) => t.status === params.status);
  if (params.priority) tasks = tasks.filter((t) => t.priority === params.priority);
  if (params.type)     tasks = tasks.filter((t) => t.type === params.type);
  if (params.search) {
    const q = params.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q));
  }

  return tasks.map(castProjectTaskToFrontend);
}

export default async function retrieveAssignedProjectTasks(
  params: AssignedProjectTasksParams,
): Promise<ProjectTaskType[]> {
  if (USE_MOCK()) return mockRetrieveAssignedProjectTasks(params);

  const response = params.projectId
    ? await fetchMyTasksInProject(params.projectId, {
        page: params.page,
        limit: params.limit ?? 100,
        status: params.status,
        priority: params.priority,
        type: params.type,
      })
    : await fetchMyTasks({
        page: params.page,
        limit: params.limit ?? 100,
        status: params.status,
        priority: params.priority,
        type: params.type,
      });
  let tasks = response.data;
  if (params.search) {
    const q = params.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q));
  }
  return tasks;
}
