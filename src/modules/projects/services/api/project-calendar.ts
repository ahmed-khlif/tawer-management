import { GET } from "@/lib/http-methods";
import { API } from "@/lib/api-endpoints";
import { isMockMode } from "@/lib/mock-config";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { castProjectCalendar } from "@/modules/projects/types/cast-project-calendar";
import { ProjectCalendarData, ProjectCalendarSource } from "@/modules/projects/types/project-calendar";

const EMPTY_CALENDAR: ProjectCalendarData = {
  projectId: "",
  from: new Date(),
  to: new Date(),
  items: [],
};

async function withAuth<T>(
  url: string,
  params: Record<string, unknown>,
  fallback: T,
  retry: () => Promise<T>,
) {
  const { access } = extractJWTokens();
  const headers = { Authorization: `Bearer ${access}` };

  try {
    const response = await GET(url, headers, { params });
    return response.data as T;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return (await refreshToken(retry)) ?? fallback;
    }

    throw error;
  }
}

export async function fetchProjectCalendar(
  projectId: string,
  params: {
    from: Date;
    to: Date;
    sources: ProjectCalendarSource[];
  },
): Promise<ProjectCalendarData> {
  if (isMockMode()) {
    return {
      ...EMPTY_CALENDAR,
      projectId,
      from: params.from,
      to: params.to,
    };
  }

  return withAuth(
    API.PROJECTS.CALENDAR(projectId),
    {
      from: params.from.toISOString(),
      to: params.to.toISOString(),
      sources: params.sources.join(","),
    },
    {
      ...EMPTY_CALENDAR,
      projectId,
      from: params.from,
      to: params.to,
    },
    () => fetchProjectCalendar(projectId, params),
  ).then(castProjectCalendar);
}

