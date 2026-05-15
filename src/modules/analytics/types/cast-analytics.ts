import {
  EmployeeAnalyticsSummary,
  EmployeeProductivityMetrics,
  ExecutiveAnalyticsOverview,
} from "@/modules/analytics/types";

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function castExecutiveAnalyticsOverview(
  raw: ExecutiveAnalyticsOverview,
): ExecutiveAnalyticsOverview {
  return {
    totalProjects: numberOrZero(raw.totalProjects),
    totalTasks: numberOrZero(raw.totalTasks),
    openTasks: numberOrZero(raw.openTasks),
    completedTasks: numberOrZero(raw.completedTasks),
    activeSprints: numberOrZero(raw.activeSprints),
    totalProjectMembers: numberOrZero(raw.totalProjectMembers),
  };
}

export function castEmployeeAnalyticsSummary(
  raw: EmployeeAnalyticsSummary,
): EmployeeAnalyticsSummary {
  return {
    userId: raw.userId,
    userName: raw.userName ?? null,
    totalAssignedTasks: numberOrZero(raw.totalAssignedTasks),
    openAssignedTasks: numberOrZero(raw.openAssignedTasks),
    completedAssignedTasks: numberOrZero(raw.completedAssignedTasks),
    totalStoryPointsAssigned: numberOrZero(raw.totalStoryPointsAssigned),
    completedStoryPoints: numberOrZero(raw.completedStoryPoints),
  };
}

export function castEmployeeProductivityMetrics(
  raw: EmployeeProductivityMetrics,
): EmployeeProductivityMetrics {
  return {
    userId: raw.userId,
    userName: raw.userName ?? null,
    hoursLogged: numberOrZero(raw.hoursLogged),
    tasksCompleted: numberOrZero(raw.tasksCompleted),
    completedTasksWithDueDate: numberOrZero(raw.completedTasksWithDueDate),
    onTimeCompletedTasks: numberOrZero(raw.onTimeCompletedTasks),
    lateCompletedTasks: numberOrZero(raw.lateCompletedTasks),
    onTimeRatePercent:
      typeof raw.onTimeRatePercent === "number" &&
      Number.isFinite(raw.onTimeRatePercent)
        ? raw.onTimeRatePercent
        : null,
  };
}
