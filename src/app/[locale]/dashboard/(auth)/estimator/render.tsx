"use client"

import { useTranslations } from "next-intl"
import useEstimator from "@/modules/estimator/hooks/use-estimator"
import ConfigBar from "@/modules/estimator/components/config-bar"
import SummaryCards from "@/modules/estimator/components/summary-cards"
import ProjectTabs from "@/modules/estimator/components/project-tabs"
import EstimationTable from "@/modules/estimator/components/estimation-table"
import CsvActions from "@/modules/estimator/components/csv-actions"
import Loading from "@/components/page-loader"
import useCurrentUser from "@/modules/auth/hooks/users/use-user"
import AccessDenied from "@/components/error/access-denied"
import type { UserRoleOnFrontendSide } from "@/modules/auth/types"
import useSaveEstimations from "@/modules/estimator/hooks/uploads/use-save-estimations"
import useLoadEstimations from "@/modules/estimator/hooks/extractions/use-load-estimations"
import { hasPermissions } from "@/modules/auth/utils/users-permissions"

const ALLOWED_ROLES: UserRoleOnFrontendSide[] = ["ceo", "cto", "cmo"]

export default function EstimatorPageRender() {
  const t = useTranslations("modules.estimator")
  const { user, isLoading } = useCurrentUser()

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    config,
    updateConfig,
    addProject,
    deleteProject,
    renameProject,
    addLine,
    addCategory,
    deleteLine,
    updateLine,
    reorderLines,
    exportCsv,
    importCsv,
    hydrated,
  } = useEstimator()

  // ── Cloud save / load — must be called before any early returns ──────────
  const { save: cloudSave, isPending: isSaving } = useSaveEstimations({ projects })
  const { load: cloudLoad, isPending: isLoadingFromCloud } = useLoadEstimations({ onLoad: importCsv })

  // ── Guards ────────────────────────────────────────────────────────────────
  if (isLoading || !hydrated) return <Loading />
  if (user && !hasPermissions(user.roles, "projectEstimator", "view")) return <AccessDenied />

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0]

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          [data-sidebar], header, nav, .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="space-y-5">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
          </div>
          <div className="flex-shrink-0">
            <CsvActions
              onExport={exportCsv}
              onImport={importCsv}
              onCloudSave={cloudSave}
              onCloudLoad={cloudLoad}
              isSaving={isSaving}
              isLoadingFromCloud={isLoadingFromCloud}
            />
          </div>
        </div>

        {/* ── Config ──────────────────────────────────────────────────── */}
        <section>
          <ConfigBar config={config} onChange={updateConfig} />
        </section>

        {/* ── Projects ────────────────────────────────────────────────── */}
        <section>
          <ProjectTabs
            projects={projects}
            activeProjectId={activeProjectId}
            onSelect={setActiveProjectId}
            onAdd={addProject}
            onDelete={deleteProject}
            onRename={renameProject}
          />
        </section>

        {activeProject && (
          <>
            {/* ── Summary ─────────────────────────────────────────────── */}
            <section>
              <SummaryCards project={activeProject} config={config} />
            </section>

            {/* ── Estimation table ────────────────────────────────────── */}
            <section>
              <EstimationTable
                project={activeProject}
                config={config}
                onAddLine={() => addLine(activeProject.id)}
                onAddCategory={() => addCategory(activeProject.id)}
                onDeleteLine={(lineId) => deleteLine(activeProject.id, lineId)}
                onUpdateLine={(lineId, partial) => updateLine(activeProject.id, lineId, partial)}
                onReorderLines={(newLines) => reorderLines(activeProject.id, newLines)}
              />
            </section>
          </>
        )}

        {/* ── Footer note ─────────────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground border-t pt-3 pb-6">{t("note")}</p>
      </div>
    </>
  )
}
