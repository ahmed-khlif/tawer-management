import { POST } from "@/lib/http-methods"
import type { AxiosError } from "axios"
import { CustomError } from "@/utils/custom-error"
import type { ErrorDataResponse } from "@/types"
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens"
import { refreshToken } from "@/modules/auth/services/refresh-token"

interface Params {
  csv: string
}

export default async function saveEstimationsToBackend({ csv }: Params): Promise<void> {
  const { access } = extractJWTokens()
  const headers = { Authorization: `Bearer ${access}` }

  try {
    await POST("/estimations", headers, { csv })
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => saveEstimationsToBackend({ csv }))
      if (res == null) throw new CustomError("Unauthorized", 401)
      return
    }

    throw new CustomError(
      axiosError.response?.data?.message || "Failed to save",
      axiosError.response?.status || 500,
    )
  }
}
