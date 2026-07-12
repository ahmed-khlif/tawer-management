import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { SprintType, SprintInResponseType } from "@/modules/projects/types/project-sprints";
import { castSprintToFrontend } from "@/modules/projects/types/cast-project-sprint";

interface Params {
  projectId: string;
  status?: string;
}

function getHeaders() {
  const { access } = extractJWTokens();
  return { Authorization: `Bearer ${access}` };
}

export default async function retrieveProjectSprints(params: Params): Promise<SprintType[]> {
  const headers = getHeaders();

  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);

  try {
    const url = query.toString()
      ? `${API.SPRINTS.LIST(params.projectId)}?${query.toString()}`
      : API.SPRINTS.LIST(params.projectId);
    const res = await GET(url, headers);
    const list = (res.data?.data ?? res.data) as SprintInResponseType[];
    return list.map(castSprintToFrontend);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => retrieveProjectSprints(params));
      if (retried != null) return retried;
    }
    throw error;
  }
}

/**
 * Fetch the full sprint detail (`GET /sprints/:id`).
 *
 * The list endpoint returns a summary; the detail endpoint includes
 * relations (members, attachments, reports) needed by the sprint detail
 * sheet.
 */
export async function retrieveSprintById(
  sprintId: string,
): Promise<SprintType | null> {
  const headers = getHeaders();

  try {
    const res = await GET(API.SPRINTS.DETAIL(sprintId), headers);
    if (!res?.data) return null;
    return castSprintToFrontend(res.data as SprintInResponseType);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => retrieveSprintById(sprintId));
      if (retried != null) return retried;
    }
    if (error?.response?.status === 404) return null;
    throw error;
  }
}
