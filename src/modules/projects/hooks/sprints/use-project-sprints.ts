import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SprintType } from "@/modules/projects/types/project-sprints";
import { retrieveProjectSprints } from "../../services";

interface Options {
  enabled?: boolean;
}

export default function useProjectSprints(projectId: string, options?: Options) {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [hasCapacity, setHasCapacity] = useState<boolean | undefined>(undefined);
  const [duration, setDuration] = useState<string | undefined>(undefined);

  const enabled = !!projectId && (options?.enabled ?? true);

  const { data, isLoading, isError } = useQuery<SprintType[]>({
    queryKey: ["project-sprints", projectId, status],
    queryFn: () => retrieveProjectSprints({ projectId, status }),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // search and sortBy are client-side only (no pagination needed for sprints)
  const filtered = (data ?? []).filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (language) {
      const hasLang = s.contents?.some(c => c.language === language);
      if (!hasLang) return false;
    }
    
    if (hasCapacity !== undefined) {
      const hasCap = !!s.capacity;
      if (hasCapacity !== hasCap) return false;
    }
    
    if (duration) {
      const days = Math.ceil((s.endDate.getTime() - s.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (duration === "short" && days > 7) return false;
      if (duration === "medium" && (days <= 7 || days > 14)) return false;
      if (duration === "long" && days <= 14) return false;
    }
    
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "startDateAsc") return a.startDate.getTime() - b.startDate.getTime();
    if (sortBy === "startDateDesc") return b.startDate.getTime() - a.startDate.getTime();
    if (sortBy === "endDateAsc") return a.endDate.getTime() - b.endDate.getTime();
    if (sortBy === "endDateDesc") return b.endDate.getTime() - a.endDate.getTime();
    return 0;
  });

  return {
    sprints: sorted,
    sprintsAreLoading: isLoading,
    sprintsError: isError,
    statusState: [status, setStatus] as [string | undefined, (s: string | undefined) => void],
    searchState: [search, setSearch] as [string, (s: string) => void],
    sortByState: [sortBy, setSortBy] as [string | undefined, (s: string | undefined) => void],
    languageState: [language, setLanguage] as [string | undefined, (s: string | undefined) => void],
    hasCapacityState: [hasCapacity, setHasCapacity] as [boolean | undefined, (s: boolean | undefined) => void],
    durationState: [duration, setDuration] as [string | undefined, (s: string | undefined) => void],
  };
}
