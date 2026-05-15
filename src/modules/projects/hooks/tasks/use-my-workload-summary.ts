import { useQuery } from "@tanstack/react-query";
import { fetchMyWorkloadSummary } from "@/modules/projects/services";
import { UserWorkloadSummary } from "@/modules/projects/types/project-tasks";

export function useMyWorkloadSummary(enabled: boolean = true) {
  return useQuery<UserWorkloadSummary>({
    queryKey: ["my-workload-summary"],
    queryFn: fetchMyWorkloadSummary,
    enabled,
    refetchOnWindowFocus: false,
  });
}

export default useMyWorkloadSummary;
