import type { EstimationLine, EstimationProject, Priority } from "../types/estimation"
import { PRIORITIES } from "../types/estimation"

// ── Column names ────────────────────────────────────────────────────────────

const EXPORT_HEADERS = ["project", "entry_type", "name", "priority", "working_days"]

// Accept both new names and legacy names from older exports
const ALIAS: Record<string, string> = {
  type: "entry_type",
  rawdays: "working_days",
}

// ── CSV serialization helpers ───────────────────────────────────────────────

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// ── Export ──────────────────────────────────────────────────────────────────

/**
 * Generates the raw CSV text for a list of projects.
 * Used both for local file download and for backend persistence.
 */
export function generateCsvText(projects: EstimationProject[]): string {
  const commentBlock = [
    "# Project Estimator — CSV Export",
    "# ---------------------------------------------------------------",
    "# project      : Project name (each unique name becomes a project tab)",
    "# entry_type   : section (label row) | feature (billable work item)",
    "# name         : Feature or section description",
    "# priority     : Critical | High | Medium | Low  (features only)",
    "# working_days : Estimated man-days, decimal allowed  (features only)",
    "# ---------------------------------------------------------------",
    "# To re-import this file: use the Import CSV button on the estimator page.",
    "# Comment lines starting with # are automatically ignored on import.",
    "# ---------------------------------------------------------------",
  ]

  const rows: string[] = [...commentBlock, EXPORT_HEADERS.join(",")]

  for (const project of projects) {
    for (const line of project.lines) {
      const row = [
        escapeCsvValue(project.name),
        escapeCsvValue(line.type === "item" ? "feature" : "section"),
        escapeCsvValue(line.name),
        escapeCsvValue(line.priority ?? ""),
        line.type === "item" ? String(line.rawDays ?? 0) : "",
      ]
      rows.push(row.join(","))
    }
  }

  return rows.join("\n")
}

/** Triggers a local CSV file download for the given projects. */
export function exportProjectsToCsv(projects: EstimationProject[]): void {
  const csv = generateCsvText(projects)
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `project-estimator-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Import ──────────────────────────────────────────────────────────────────

interface ImportResult {
  projects: EstimationProject[]
  skippedRows: number
}

export function importProjectsFromCsv(
  csvText: string,
  onSuccess: (msg: string) => void,
  onWarning: (msg: string) => void,
  onError: (msg: string) => void,
): ImportResult | null {
  try {
    // Strip BOM and split lines; skip comment lines
    const allLines = csvText.replace(/^\uFEFF/, "").trim().split(/\r?\n/)
    const lines = allLines.filter((l) => !l.trimStart().startsWith("#") && l.trim() !== "")

    if (lines.length < 2) {
      onError("Failed to import CSV — check the file format")
      return null
    }

    // Resolve column indices — support both new and legacy names
    const rawHeader = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
    const header = rawHeader.map((h) => ALIAS[h] ?? h)

    const projectIdx = header.indexOf("project")
    const typeIdx = header.indexOf("entry_type")
    const nameIdx = header.indexOf("name")
    const priorityIdx = header.indexOf("priority")
    const rawDaysIdx = header.indexOf("working_days")

    if (projectIdx === -1 || typeIdx === -1 || nameIdx === -1) {
      onError("Failed to import CSV — missing required columns (project, entry_type, name)")
      return null
    }

    const projectMap = new Map<string, EstimationProject>()
    const projectOrder: string[] = []
    let skippedRows = 0

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i])
      const projectName = cols[projectIdx]?.trim()
      const rawType = cols[typeIdx]?.trim().toLowerCase()
      const name = cols[nameIdx]?.trim()

      if (!projectName || !rawType || !name) {
        skippedRows++
        continue
      }

      // Accept "feature"/"item" and "section"/"category" (both new and legacy)
      const type: "item" | "category" | null =
        rawType === "feature" || rawType === "item"
          ? "item"
          : rawType === "section" || rawType === "category"
            ? "category"
            : null

      if (!type) {
        skippedRows++
        continue
      }

      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, { id: crypto.randomUUID(), name: projectName, lines: [] })
        projectOrder.push(projectName)
      }

      const project = projectMap.get(projectName)!

      const newLine: EstimationLine = { id: crypto.randomUUID(), type, name }

      if (type === "item") {
        const priorityRaw = cols[priorityIdx]?.trim() as Priority
        if (priorityRaw && !PRIORITIES.includes(priorityRaw)) {
          skippedRows++
          continue
        }
        newLine.priority = priorityRaw || "Medium"

        const rawDaysRaw = rawDaysIdx !== -1 ? parseFloat(cols[rawDaysIdx]) : NaN
        newLine.rawDays = isNaN(rawDaysRaw) ? 0 : rawDaysRaw
      }

      project.lines.push(newLine)
    }

    const projects = projectOrder.map((name) => projectMap.get(name)!)

    if (projects.length === 0) {
      onError("Failed to import CSV — no valid rows found")
      return null
    }

    if (skippedRows > 0) {
      onWarning(`${skippedRows} row(s) were skipped due to invalid data`)
    }

    onSuccess("CSV imported successfully")
    return { projects, skippedRows }
  } catch {
    onError("Failed to import CSV — check the file format")
    return null
  }
}
