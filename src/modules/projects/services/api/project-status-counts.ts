import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";

export interface ProjectStatusCounts {
  total: number;
  Pending: number;
  Running: number;
  Stopped: number;
  Completed: number;
}

export interface FetchProjectStatusCountsParams {
  name?: string;
  businessUnit?: string;
  paid?: boolean;
  sortBy?: string;
  /** When set, matches backend `ProjectQueryDto.isArchived` (omit for “all”) */
  isArchived?: boolean;
}

export default async function fetchProjectStatusCounts(
  params: FetchProjectStatusCountsParams,
): Promise<ProjectStatusCounts> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  const query = new URLSearchParams();
  if (params.name) query.append("name", params.name);
  if (params.businessUnit) query.append("businessUnit", params.businessUnit);
  if (params.paid !== undefined) query.append("paid", String(params.paid));
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.isArchived !== undefined) {
    query.append("isArchived", String(params.isArchived));
  }

  const qs = query.toString();
  const url = qs ? `${API.PROJECTS.STATUS_COUNTS()}?${qs}` : API.PROJECTS.STATUS_COUNTS();

  try {
    const res = await GET(url, headers);
    const raw = res.data as ProjectStatusCounts | { data?: ProjectStatusCounts };
    return "data" in raw && raw.data != null ? raw.data : (raw as ProjectStatusCounts);
  } catch (error: unknown) {
    const ax = error as { response?: { status?: number } };
    if (ax?.response?.status === 401) {
      const retried = await refreshToken(() => fetchProjectStatusCounts(params));
      if (retried) return retried;
    }
    throw error;
  }
}
