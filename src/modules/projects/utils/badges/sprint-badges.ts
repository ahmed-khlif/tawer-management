import { SprintStatus } from "../../types/project-sprints";

export const sprintStatusClasses: Record<SprintStatus, string> = {
  Running: "pm-badge-sprint-running border",
  Pending: "pm-badge-sprint-pending border",
  Stopped: "pm-badge-sprint-stopped border",
  Completed: "pm-badge-sprint-completed border",
};

export const sprintStatusDotColors: Record<SprintStatus, string> = {
  Running: "pm-dot-sprint-running",
  Pending: "pm-dot-sprint-pending",
  Stopped: "pm-dot-sprint-stopped",
  Completed: "pm-dot-sprint-completed",
};
