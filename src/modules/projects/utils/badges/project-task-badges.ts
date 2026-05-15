import type { CSSProperties } from "react";

// Project task status — badge and dot colors
export const projectTaskStatusClasses: Record<string, string> = {
  BACKLOG: "pm-badge-task-backlog border",
  TODO: "pm-badge-task-todo border",
  IN_PROGRESS: "pm-badge-task-in-progress border",
  TESTING: "pm-badge-task-testing border",
  IN_REVIEW: "pm-badge-task-in-review border",
  DONE: "pm-badge-task-done border",
};

export const projectTaskStatusDotColors: Record<string, string> = {
  BACKLOG: "pm-dot-task-backlog",
  TODO: "pm-dot-task-todo",
  IN_PROGRESS: "pm-dot-task-in-progress",
  TESTING: "pm-dot-task-testing",
  IN_REVIEW: "pm-dot-task-in-review",
  DONE: "pm-dot-task-done",
};

// Project task priority — badge and dot colors
export const projectTaskPriorityClasses: Record<string, string> = {
  URGENT: "pm-badge-priority-urgent border",
  HIGH: "pm-badge-priority-high border",
  MEDIUM: "pm-badge-priority-medium border",
  LOW: "pm-badge-priority-low border",
};

export const projectTaskPriorityDotColors: Record<string, string> = {
  URGENT: "pm-dot-priority-urgent",
  HIGH: "pm-dot-priority-high",
  MEDIUM: "pm-dot-priority-medium",
  LOW: "pm-dot-priority-low",
};

// Project task type — badge and dot colors
export const projectTaskTypeClasses: Record<string, string> = {
  STORY: "pm-badge-type-story border",
  TASK: "pm-badge-type-task border",
  BUG: "pm-badge-type-bug border",
  SPIKE: "pm-badge-type-spike border",
  EPIC: "pm-badge-type-epic border",
};

export const projectTaskTypeDotColors: Record<string, string> = {
  STORY: "pm-dot-type-story",
  TASK: "pm-dot-type-task",
  BUG: "pm-dot-type-bug",
  SPIKE: "pm-dot-type-spike",
  EPIC: "pm-dot-type-epic",
};

// Epic badge
export const epicBadgeClasses = "pm-badge-epic-strip border";

// Risk levels (AI blocker risk, capacity risk, anomaly severity)
// Defaults to MEDIUM tone if the level is unknown.
export const riskLevelClasses: Record<string, string> = {
  LOW: "pm-badge-risk-low border",
  MEDIUM: "pm-badge-risk-medium border",
  HIGH: "pm-badge-risk-high border",
  INFO: "pm-badge-risk-info border",
};

export const riskSurfaceClasses: Record<string, string> = {
  LOW: "pm-surface-risk-low",
  MEDIUM: "pm-surface-risk-medium",
  HIGH: "pm-surface-risk-high",
};

export function resolveRiskBadgeClass(level?: string | null): string {
  if (!level) return "pm-badge-risk-info border";
  return (
    riskLevelClasses[level.toUpperCase()] ?? "pm-badge-risk-info border"
  );
}

export function resolveRiskSurfaceClass(level?: string | null): string {
  if (!level) return "";
  return riskSurfaceClasses[level.toUpperCase()] ?? "";
}

/**
 * Resolve the visual style for a task status badge.
 *
 * Default enum statuses (BACKLOG/TODO/IN_PROGRESS/…/DONE) come from a fixed
 * Tailwind class palette. Project-defined custom statuses don't have a class
 * in the palette — we fall back to inline `style` using the configured hex
 * color so kanban columns and task badges actually show the user-picked color.
 */
export function resolveTaskStatusStyle(
  status: string | undefined | null,
  customStatusColorByName?: Record<string, string>,
): { className?: string; style?: CSSProperties } {
  if (!status) return {};
  const upper = status.toUpperCase().replace(/\s+/g, "_");
  const cls = projectTaskStatusClasses[upper];
  if (cls) return { className: cls };

  const lower = status.trim().toLowerCase();
  const hex = customStatusColorByName?.[lower];
  if (hex) {
    return {
      style: {
        backgroundColor: `${hex}1a`,
        color: hex,
        borderColor: `${hex}33`,
      },
    };
  }
  return {};
}

export function resolveTaskStatusDotStyle(
  status: string | undefined | null,
  customStatusColorByName?: Record<string, string>,
): { className?: string; style?: CSSProperties } {
  if (!status) return {};
  const upper = status.toUpperCase().replace(/\s+/g, "_");
  const cls = projectTaskStatusDotColors[upper];
  if (cls) return { className: cls };

  const lower = status.trim().toLowerCase();
  const hex = customStatusColorByName?.[lower];
  if (hex) return { style: { backgroundColor: hex } };
  return {};
}
