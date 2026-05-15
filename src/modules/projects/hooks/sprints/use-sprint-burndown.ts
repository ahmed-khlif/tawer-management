import { useQuery } from "@tanstack/react-query";
import { fetchSprintBurndown } from "@/modules/projects/services/api/sprint-burndown";

export function useSprintBurndown(sprintId?: string | null) {
  return useQuery({
    queryKey: ["sprint-burndown", sprintId],
    queryFn: () => fetchSprintBurndown(sprintId!),
    enabled: !!sprintId,
    refetchOnWindowFocus: false,
  });
}

export default useSprintBurndown;
