"use client"

import { useCallback } from "react"
import { toast } from "sonner"
import { useEstimatorStore } from "../store/estimator-store"
import { exportProjectsToCsv, importProjectsFromCsv } from "../utils/csv"

export default function useEstimator() {
  const store = useEstimatorStore()

  const exportCsv = useCallback(() => {
    exportProjectsToCsv(store.projects)
  }, [store.projects])

  const importCsv = useCallback(
    (csvText: string) => {
      const result = importProjectsFromCsv(
        csvText,
        (msg) => toast.success(msg),
        (msg) => toast.warning(msg),
        (msg) => toast.error(msg),
      )
      if (result) {
        store._setProjects(result.projects)
        store.setActiveProjectId(result.projects[0].id)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store._setProjects, store.setActiveProjectId],
  )

  return {
    projects: store.projects,
    activeProjectId: store.activeProjectId,
    setActiveProjectId: store.setActiveProjectId,
    config: store.config,
    updateConfig: store.updateConfig,
    addProject: store.addProject,
    deleteProject: store.deleteProject,
    renameProject: store.renameProject,
    addLine: store.addLine,
    addCategory: store.addCategory,
    deleteLine: store.deleteLine,
    updateLine: store.updateLine,
    reorderLines: store.reorderLines,
    exportCsv,
    importCsv,
    hydrated: store._hasHydrated,
  }
}
