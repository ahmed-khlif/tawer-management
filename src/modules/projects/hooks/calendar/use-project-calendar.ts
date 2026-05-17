import { useQuery } from "@tanstack/react-query";
import { fetchProjectCalendar } from "@/modules/projects/services/api/project-calendar";
import { ProjectCalendarSource } from "@/modules/projects/types/project-calendar";

export default function useProjectCalendar(
  projectId: string,
  params: {
    from: Date | null;
    to: Date | null;
    sources: ProjectCalendarSource[];
  },
) {
  return useQuery({
    queryKey: [
      "project-calendar",
      projectId,
      params.from?.toISOString() ?? null,
      params.to?.toISOString() ?? null,
      params.sources.join(","),
    ],
    queryFn: () =>
      fetchProjectCalendar(projectId, {
        from: params.from ?? new Date(),
        to: params.to ?? new Date(),
        sources: params.sources,
      }),
    enabled:
      !!projectId &&
      !!params.from &&
      !!params.to &&
      params.sources.length > 0,
    refetchOnWindowFocus: false,
  });
}

