"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { CustomError } from "@/utils/custom-error"
import loadEstimationsFromBackend from "../../services/extractions/estimations"

interface Params {
  /** Called with the raw CSV text when the server returns data. */
  onLoad: (csvText: string) => void
}

export default function useLoadEstimations({ onLoad }: Params) {
  const t = useTranslations("modules.estimator")
  const tErrors = useTranslations("modules.estimator.errors")
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)

  const load = async () => {
    setIsPending(true)

    try {
      const result = await loadEstimationsFromBackend()

      if (!result || !result.csv) {
        toast.info(tErrors("noSavedData"))
        return
      }

      onLoad(result.csv)
      toast.success(tErrors("loadSuccess"))
    } catch (thrownError) {
      const error = thrownError as CustomError

      if (error.status === 401) {
        router.push("/login")
        return
      }

      if (error.status === 403) {
        toast.error(tErrors("permissionDenied"))
        return
      }

      if (error.status === 404) {
        toast.info(tErrors("noSavedData"))
        return
      }

      toast.error(tErrors("loadFailed"))
    } finally {
      setIsPending(false)
    }
  }

  return { load, isPending }
}
