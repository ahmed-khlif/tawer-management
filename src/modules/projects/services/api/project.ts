import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { ProjectType, ProjectInResponseType } from "@/modules/projects/types/projects";
import { castProjectToFrontend } from "@/modules/projects/types/cast-project";

export default async function retrieveProjectById(id: string): Promise<ProjectType | null> {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const res = await GET(API.PROJECTS.DETAIL(id), headers);
    return castProjectToFrontend(res.data as ProjectInResponseType);
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const retried = await refreshToken(() => retrieveProjectById(id));
      if (retried) return retried;
    }
    if (error?.response?.status === 404) return null;
    throw error;
  }
}
