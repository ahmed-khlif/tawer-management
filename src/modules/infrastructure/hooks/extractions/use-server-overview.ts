"use client"

import { useQuery } from "@tanstack/react-query"
import useBackendLocale from "@/hooks/use-backend-locale"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import retrieveServerOverview from "../../services/extractions/server-overview"
import type { ServerOverviewType } from "../../types/servers"

export default function useServerOverview() {
  const { backendLocale } = useBackendLocale()
  const { user } = useCurrentUser()

  const query = useQuery<ServerOverviewType | null>({
    queryKey: ["infrastructure", "servers", "overview", user?.id, backendLocale],
    queryFn: () => retrieveServerOverview({ locale: backendLocale }),
    enabled: user !== null,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60000,
  })

  return {
    overview: query.data,
    overviewIsLoading: query.isLoading,
    overviewError: query.isError,
  }
}
