import { GET } from "@/lib/http-methods"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"
import type { AxiosError } from "axios"
import type { BackendLocale } from "@/types/locales"
import { getBackendLocaleOnParams } from "@/utils/backend-locale"
import { formatDateToFrontendFormat } from "@/utils/date"
import type { ServerOverviewType } from "../../types/servers"

interface Params {
  locale?: BackendLocale
}

interface ServerOverviewResponse {
  total: number
  running: number
  incidentsOpen: number
  expiringSoon: number
  unpaid: number
  lastHealthCheckAt?: string | null
}

export default async function retrieveServerOverview({
  locale,
}: Params): Promise<ServerOverviewType | null> {
  const { access } = extractJWTokens()
  const headers = {
    Authorization: `Bearer ${access}`,
  }

  const queryParams: string[] = []
  if (locale) queryParams.push(getBackendLocaleOnParams({ locale }))

  try {
    const querySuffix = queryParams.length ? `?${queryParams.join("&")}` : ""
    const res = await GET(`/servers/overview${querySuffix}`, headers)
    const data = res.data as ServerOverviewResponse

    return {
      ...data,
      lastHealthCheckAt: data.lastHealthCheckAt
        ? formatDateToFrontendFormat(new Date(data.lastHealthCheckAt))
        : undefined,
    }
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() =>
        retrieveServerOverview({
          locale,
        }),
      )

      if (res == null) return null
      return res
    }

    return null
  }
}
