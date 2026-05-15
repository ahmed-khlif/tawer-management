import { ProjectStatus, ProjectTypeEnum } from "../../types/projects";

// Project status badge classes (pair with Badge variant="outline")
export const projectStatusClasses: Record<ProjectStatus, string> = {
  Running: "pm-badge-project-running border",
  Pending: "pm-badge-project-pending border",
  Stopped: "pm-badge-project-stopped border",
  Completed: "pm-badge-project-completed border",
};

// Project type badge classes
export const projectTypeClasses: Record<ProjectTypeEnum, string> = {
  AGILE: "pm-badge-project-type-agile border",
  FREESTYLE: "pm-badge-project-type-freestyle border",
};

// Business unit badge classes
export const businessUnitClasses: Record<string, string> = {
  TawerDev: "pm-badge-bu-dev border",
  TawerCreative: "pm-badge-bu-creative border",
};

export const businessUnitFallbackClasses = "bg-muted text-muted-foreground";

export const businessUnitNamed: Record<string, string> = {
  TawerDev: "Tawer Dev",
  TawerCreative: "Tawer Creative"
};
