"use client"

import { useQuery } from "@tanstack/react-query"
import useBackendLocale from "@/hooks/use-backend-locale"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import retrieveServiceOverview from "../../services/extractions/service-overview"
import type { ServiceOverviewType } from "../../types/services"

export default function useServiceOverview() {
  const { backendLocale } = useBackendLocale()
  const { user } = useCurrentUser()

  const query = useQuery<ServiceOverviewType | null>({
    queryKey: ["infrastructure", "services", "overview", user?.id, backendLocale],
    queryFn: () => retrieveServiceOverview({ locale: backendLocale }),
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
