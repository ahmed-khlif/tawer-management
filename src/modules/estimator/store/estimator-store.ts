import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { EstimationLine, EstimationProject, EstimatorConfig } from "../types/estimation"
import { DEFAULT_CONFIG, DEFAULT_PROJECTS } from "../utils/defaults"

export interface EstimatorStore {
  // ── State ──────────────────────────────────────────────────────────────────
  projects: EstimationProject[]
  activeProjectId: string
  config: EstimatorConfig
  _hasHydrated: boolean

  // ── Internal ───────────────────────────────────────────────────────────────
  _setHasHydrated: (value: boolean) => void
  _setProjects: (projects: EstimationProject[]) => void

  // ── Public actions ─────────────────────────────────────────────────────────
  setActiveProjectId: (id: string) => void
  updateConfig: (partial: Partial<EstimatorConfig>) => void
  addProject: () => void
  deleteProject: (projectId: string) => void
  renameProject: (projectId: string, name: string) => void
  addLine: (projectId: string) => void
  addCategory: (projectId: string) => void
  deleteLine: (projectId: string, lineId: string) => void
  updateLine: (projectId: string, lineId: string, partial: Partial<EstimationLine>) => void
  reorderLines: (projectId: string, lines: EstimationLine[]) => void
}

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      projects: DEFAULT_PROJECTS,
      activeProjectId: DEFAULT_PROJECTS[0] ? DEFAULT_PROJECTS[0].id : "",
      config: DEFAULT_CONFIG,
      _hasHydrated: false,

      // ── Internal ───────────────────────────────────────────────────────────
      _setHasHydrated: (value) => set({ _hasHydrated: value }),
      _setProjects: (projects) => set({ projects }),

      // ── Actions ────────────────────────────────────────────────────────────
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      updateConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),

      addProject: () => {
        const newProject: EstimationProject = {
          id: crypto.randomUUID(),
          name: "New Project",
          lines: [],
        }
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }))
      },

      deleteProject: (projectId) =>
        set((state) => {
          const next = state.projects.filter((p) => p.id !== projectId)
          return {
            projects: next,
            activeProjectId:
              state.activeProjectId === projectId && next.length > 0
                ? next[0].id
                : state.activeProjectId,
          }
        }),

      renameProject: (projectId, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, name } : p,
          ),
        })),

      addLine: (projectId) => {
        const newLine: EstimationLine = {
          id: crypto.randomUUID(),
          type: "item",
          name: "New feature",
          priority: "Medium",
          rawDays: 1,
        }
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, lines: [...p.lines, newLine] } : p,
          ),
        }))
      },

      addCategory: (projectId) => {
        const newLine: EstimationLine = {
          id: crypto.randomUUID(),
          type: "category",
          name: "New Section",
        }
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, lines: [...p.lines, newLine] } : p,
          ),
        }))
      },

      deleteLine: (projectId, lineId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, lines: p.lines.filter((l) => l.id !== lineId) }
              : p,
          ),
        })),

      updateLine: (projectId, lineId, partial) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                ...p,
                lines: p.lines.map((l) =>
                  l.id === lineId ? { ...l, ...partial } : l,
                ),
              }
              : p,
          ),
        })),

      reorderLines: (projectId, lines) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, lines } : p,
          ),
        })),
    }),
    {
      name: "estimator-state",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true)
      },
    },
  ),
)
