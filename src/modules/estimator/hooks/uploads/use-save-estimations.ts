"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { CustomError } from "@/utils/custom-error"
import type { EstimationProject } from "../../types/estimation"
import { generateCsvText } from "../../utils/csv"
import saveEstimationsToBackend from "../../services/uploads/estimations"

interface Params {
  projects: EstimationProject[]
}

export default function useSaveEstimations({ projects }: Params) {
  const tErrors = useTranslations("modules.estimator.errors")
  const router = useRouter()

  const [isPending, setIsPending] = useState(false)

  const save = async () => {
    setIsPending(true)

    try {
      const csv = generateCsvText(projects)
      await saveEstimationsToBackend({ csv })
      toast.success(tErrors("saveSuccess"))
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

      if (error.status === 500) {
        toast.error(tErrors("serverError"))
        return
      }

      toast.error(tErrors("saveFailed"))
    } finally {
      setIsPending(false)
    }
  }

  return { save, isPending }
}
