import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";
import { PaginationType } from "@/types/pagination";
import mockData from "../../mock_data/mock.json";

interface Params {
  page: number;
  limit?: number;
  name?: string;
  status?: string;
  businessUnit?: string;
  projectType?: string;
  paid?: boolean;
  sortBy?: string;
}

export async function mockRetrieveProjects(params: Params): Promise<{ data: ProjectType[]; pagination: PaginationType }> {
  const limit = params.limit ?? 10;
  let list = (mockData.projects as unknown as ProjectInResponseType[]).map(castProjectToFrontend);

  if (params.status)       list = list.filter(p => p.status === params.status);
  if (params.businessUnit) list = list.filter(p => p.businessUnit === params.businessUnit);
  if (params.projectType)  list = list.filter(p => p.projectType === params.projectType);
  if (params.paid !== undefined) list = list.filter(p => p.paid === params.paid);
  if (params.name)         list = list.filter(p => p.name.toLowerCase().includes(params.name!.toLowerCase()));

  const records = list.length;
  const totalPages = Math.max(1, Math.ceil(records / limit));
  const start = (params.page - 1) * limit;
  const data = list.slice(start, start + limit);

  return {
    data,
    pagination: { currentPage: params.page, records, totalPages },
  };
}

/** Mirrors GET /projects/status-counts for mock mode */
export async function mockFetchProjectStatusCounts(params: {
  name?: string;
  businessUnit?: string;
  paid?: boolean;
  sortBy?: string;
  isArchived?: boolean;
}): Promise<{
  total: number;
  Pending: number;
  Running: number;
  Stopped: number;
  Completed: number;
}> {
  const full = await mockRetrieveProjects({
    page: 1,
    limit: 9999,
    name: params.name,
    businessUnit: params.businessUnit,
    paid: params.paid,
    sortBy: params.sortBy,
  });
  let list = full.data;
  if (params.isArchived !== undefined) {
    list = list.filter((p) => p.isArchived === params.isArchived);
  }
  const Pending = list.filter((p) => p.status === "Pending").length;
  const Running = list.filter((p) => p.status === "Running").length;
  const Stopped = list.filter((p) => p.status === "Stopped").length;
  const Completed = list.filter((p) => p.status === "Completed").length;
  return {
    total: list.length,
    Pending,
    Running,
    Stopped,
    Completed,
  };
}
