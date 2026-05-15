import { useQuery } from "@tanstack/react-query";
import { fetchSprintVelocity } from "@/modules/projects/services/api/sprint-velocity";

export function useSprintVelocity(projectId?: string | null) {
  return useQuery({
    queryKey: ["sprint-velocity", projectId],
    queryFn: () => fetchSprintVelocity(projectId!),
    enabled: !!projectId,
    refetchOnWindowFocus: false,
  });
}

export default useSprintVelocity;
