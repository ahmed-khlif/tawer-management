import {
  AnalyticsTrendPoint,
  EmployeeAnalyticsSnapshot,
  EmployeeAnalyticsSummary,
  EmployeeProductivityMetrics,
  ExecutiveAnalyticsSnapshot,
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

function castTrendPoint(raw: AnalyticsTrendPoint): AnalyticsTrendPoint {
  return {
    label: raw.label,
    value: numberOrZero(raw.value),
  };
}

export function castExecutiveAnalyticsSnapshot(
  raw: ExecutiveAnalyticsSnapshot,
): ExecutiveAnalyticsSnapshot {
  return {
    scopeLabel: raw.scopeLabel ?? "Viewing: Executive Portfolio",
    completionTrend: Array.isArray(raw.completionTrend)
      ? raw.completionTrend.map(castTrendPoint)
      : [],
    overdueTrend: Array.isArray(raw.overdueTrend)
      ? raw.overdueTrend.map(castTrendPoint)
      : [],
    riskProjects: Array.isArray(raw.riskProjects)
      ? raw.riskProjects.map((project) => ({
          projectId: project.projectId,
          projectName: project.projectName,
          businessUnit: project.businessUnit,
          status: project.status,
          overdueTasks: numberOrZero(project.overdueTasks),
          openTasks: numberOrZero(project.openTasks),
          endDate: project.endDate ?? null,
          summary: project.summary,
        }))
      : [],
  };
}

export function castEmployeeAnalyticsSnapshot(
  raw: EmployeeAnalyticsSnapshot,
): EmployeeAnalyticsSnapshot {
  return {
    userId: raw.userId,
    userName: raw.userName ?? null,
    workloadLabel: raw.workloadLabel ?? "Watch",
    sharedProjectCount: numberOrZero(raw.sharedProjectCount),
    completedTrend: Array.isArray(raw.completedTrend)
      ? raw.completedTrend.map(castTrendPoint)
      : [],
    onTimeTrend: Array.isArray(raw.onTimeTrend)
      ? raw.onTimeTrend.map(castTrendPoint)
      : [],
    workloadTrend: Array.isArray(raw.workloadTrend)
      ? raw.workloadTrend.map(castTrendPoint)
      : [],
  };
}
