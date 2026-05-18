import retrieveProjects from "./projects";
import type { ProjectType } from "@/modules/projects/types/projects";

type RetrieveProjectParams = {
  limit?: number;
  name?: string;
  status?: string;
  businessUnit?: string;
  paid?: boolean;
  isArchived?: boolean;
  sortBy?: string;
};

export async function retrieveAllProjects(
  params: RetrieveProjectParams = {},
): Promise<ProjectType[]> {
  const pageSize = params.limit ?? 100;
  const firstPage = await retrieveProjects({ ...params, page: 1, limit: pageSize });
  if (!firstPage) return [];

  const totalPages = Math.max(firstPage.pagination.totalPages ?? 1, 1);
  if (totalPages === 1) return firstPage.data;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      retrieveProjects({
        ...params,
        page: index + 2,
        limit: pageSize,
      }),
    ),
  );

  return [
    ...firstPage.data,
    ...remaining.flatMap((page) => page?.data ?? []),
  ];
}
