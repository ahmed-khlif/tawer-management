import { GET } from "@/lib/http-methods"
import type { AxiosError } from "axios"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"

export interface EstimationLoadResponse {
  csv: string
}

export default async function loadEstimationsFromBackend(): Promise<EstimationLoadResponse | null> {
  const { access } = extractJWTokens()
  const headers = { Authorization: `Bearer ${access}` }

  try {
    const res = await GET("/estimations", headers)
    return res.data as EstimationLoadResponse
  } catch (error) {
    const axiosError = error as AxiosError

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => loadEstimationsFromBackend())
      if (!res) return null
      return res
    }

    throw error
  }
}
