import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import {
  castProjectActivityItem,
  type ProjectActivityFilters,
  type ProjectActivityItemInResponse,
  type ProjectActivityListResponse,
} from "@/modules/projects/types/project-activity";
import type { PaginationType } from "@/types/pagination";

export async function fetchProjectActivity(
  filters: ProjectActivityFilters,
): Promise<ProjectActivityListResponse | null> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  query.set("page", String(filters.page ?? 1));
  query.set("limit", String(filters.limit ?? 20));
  if (filters.startDateFrom) query.set("startDateFrom", filters.startDateFrom);
  if (filters.endDateTo) query.set("endDateTo", filters.endDateTo);
  if (filters.projectIds?.length) query.set("projectIds", filters.projectIds.join(","));
  if (filters.actorIds?.length) query.set("actorIds", filters.actorIds.join(","));
  if (filters.actorName) query.set("actorName", filters.actorName);
  if (filters.types?.length) query.set("types", filters.types.join(","));
  if (filters.search) query.set("search", filters.search);

  try {
    const res = await GET(`${API.PROJECTS.ACTIVITY()}?${query.toString()}`, headers);
    return {
      data: (res.data.data as ProjectActivityItemInResponse[]).map(castProjectActivityItem),
      pagination: res.data.pagination as PaginationType,
    };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => fetchProjectActivity(filters));
      if (retried) return retried;
    }
    throw error;
  }
}

export async function fetchAllProjectActivity(
  filters: ProjectActivityFilters,
): Promise<ProjectActivityListResponse["data"]> {
  const pageSize = filters.limit ?? 100;
  const firstPage = await fetchProjectActivity({ ...filters, page: 1, limit: pageSize });
  if (!firstPage) return [];

  const totalPages = Math.max(firstPage.pagination.totalPages ?? 1, 1);
  if (totalPages === 1) return firstPage.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchProjectActivity({
        ...filters,
        page: index + 2,
        limit: pageSize,
      }),
    ),
  );

  return [
    ...firstPage.data,
    ...rest.flatMap((page) => page?.data ?? []),
  ];
}
