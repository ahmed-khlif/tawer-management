import {
  ProjectAiInsights,
  ProjectCapacity,
  ProjectProductivityMetrics,
  ProjectReportOverview,
  ProjectTeamWorkload,
} from "@/modules/projects/types/project-insights";

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function castProjectCapacity(raw: ProjectCapacity): ProjectCapacity {
  return {
    projectId: raw.projectId,
    activeSprints: numberOrZero(raw.activeSprints),
    totalCapacityPoints: numberOrZero(raw.totalCapacityPoints),
    totalCommittedPoints: numberOrZero(raw.totalCommittedPoints),
    totalRemainingPoints: numberOrZero(raw.totalRemainingPoints),
    unassignedCommittedPoints: numberOrZero(raw.unassignedCommittedPoints),
    isOverCapacity: Boolean(raw.isOverCapacity),
    riskLevel: raw.riskLevel,
    members: Array.isArray(raw.members)
      ? raw.members.map((member) => ({
          userId: member.userId,
          name: member.name,
          committedPoints: numberOrZero(member.committedPoints),
          capacityPoints: numberOrZero(member.capacityPoints),
          remainingPoints: numberOrZero(member.remainingPoints),
          utilizationPercent: numberOrZero(member.utilizationPercent),
          trackedWorkMinutes: numberOrZero(member.trackedWorkMinutes),
          isOverCapacity: Boolean(member.isOverCapacity),
        }))
      : [],
  };
}

export function castProjectReportOverview(
  raw: ProjectReportOverview,
): ProjectReportOverview {
  return {
    projectId: raw.projectId,
    totalTasks: numberOrZero(raw.totalTasks),
    completedTasks: numberOrZero(raw.completedTasks),
    openTasks: numberOrZero(raw.openTasks),
    overdueTasks: numberOrZero(raw.overdueTasks),
    stuckTasks: numberOrZero(raw.stuckTasks),
    completionPercent: numberOrZero(raw.completionPercent),
    activeSprints: numberOrZero(raw.activeSprints),
    sprintStatusBreakdown: {
      pending: numberOrZero(raw.sprintStatusBreakdown?.pending),
      running: numberOrZero(raw.sprintStatusBreakdown?.running),
    },
    milestones: {
      total: numberOrZero(raw.milestones?.total),
      completed: numberOrZero(raw.milestones?.completed),
      completionPercent: numberOrZero(raw.milestones?.completionPercent),
    },
  };
}

export function castProjectProductivityMetrics(
  raw: ProjectProductivityMetrics,
): ProjectProductivityMetrics {
  return {
    projectId: raw.projectId,
    projectCompletionPercent: numberOrZero(raw.projectCompletionPercent),
    teamAverageProductivityScore: numberOrZero(raw.teamAverageProductivityScore),
    members: Array.isArray(raw.members)
      ? raw.members.map((member) => ({
          userId: member.userId,
          name: member.name,
          completedTasks: numberOrZero(member.completedTasks),
          assignedTasks: numberOrZero(member.assignedTasks),
          completionRatePercent: numberOrZero(member.completionRatePercent),
          loggedHours: numberOrZero(member.loggedHours),
          productivityScore: numberOrZero(member.productivityScore),
        }))
      : [],
  };
}

export function castProjectTeamWorkload(
  raw: ProjectTeamWorkload,
): ProjectTeamWorkload {
  return {
    projectId: raw.projectId,
    totalAssignedTasks: numberOrZero(raw.totalAssignedTasks),
    totalOpenTasks: numberOrZero(raw.totalOpenTasks),
    totalCompletedTasks: numberOrZero(raw.totalCompletedTasks),
    totalLoggedHours: numberOrZero(raw.totalLoggedHours),
    members: Array.isArray(raw.members)
      ? raw.members.map((member) => ({
          userId: member.userId,
          name: member.name,
          assignedTasks: numberOrZero(member.assignedTasks),
          openTasks: numberOrZero(member.openTasks),
          completedTasks: numberOrZero(member.completedTasks),
          overdueTasks: numberOrZero(member.overdueTasks),
          storyPoints: numberOrZero(member.storyPoints),
          loggedHours: numberOrZero(member.loggedHours),
          workloadSharePercent: numberOrZero(member.workloadSharePercent),
        }))
      : [],
  };
}

export function castProjectAiInsights(raw: ProjectAiInsights): ProjectAiInsights {
  return {
    projectId: raw.projectId,
    metrics: {
      completedTasksWithEstimates: numberOrZero(raw.metrics?.completedTasksWithEstimates),
      estimateMaeHours: numberOrZero(raw.metrics?.estimateMaeHours),
      onEstimateRatePercent: numberOrZero(raw.metrics?.onEstimateRatePercent),
      blockedTasks: numberOrZero(raw.metrics?.blockedTasks),
    },
    anomalies: Array.isArray(raw.anomalies)
      ? raw.anomalies.map((anomaly) => ({
          code: anomaly.code,
          message: anomaly.message,
          severity: anomaly.severity,
        }))
      : [],
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.filter(
          (recommendation): recommendation is string =>
            typeof recommendation === "string",
        )
      : [],
  };
}
