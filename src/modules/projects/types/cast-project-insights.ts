import {
  ProjectAiInsights,
  ProjectDashboardSnapshot,
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
          title: anomaly.title,
          targetType: anomaly.targetType,
          targetId: anomaly.targetId,
          ownerUserId: anomaly.ownerUserId,
          recommendedAction: anomaly.recommendedAction,
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

export function castProjectDashboardSnapshot(
  raw: ProjectDashboardSnapshot,
): ProjectDashboardSnapshot {
  return {
    projectId: raw.projectId,
    projectName: raw.projectName,
    businessUnit: raw.businessUnit,
    projectType: raw.projectType,
    health: {
      score: numberOrZero(raw.health?.score),
      status: raw.health?.status ?? "WATCH",
      summary: raw.health?.summary ?? "",
      drivers: Array.isArray(raw.health?.drivers)
        ? raw.health.drivers.map((driver) => ({
            key: driver.key,
            label: driver.label,
            impact: numberOrZero(driver.impact),
            value: numberOrZero(driver.value),
            summary: driver.summary,
          }))
        : [],
    },
    delivery: {
      totalTasks: numberOrZero(raw.delivery?.totalTasks),
      completedTasks: numberOrZero(raw.delivery?.completedTasks),
      openTasks: numberOrZero(raw.delivery?.openTasks),
      overdueTasks: numberOrZero(raw.delivery?.overdueTasks),
      blockedTasks: numberOrZero(raw.delivery?.blockedTasks),
      stuckTasks: numberOrZero(raw.delivery?.stuckTasks),
      completionPercent: numberOrZero(raw.delivery?.completionPercent),
      summary: raw.delivery?.summary ?? "",
      activeSprintLabel: raw.delivery?.activeSprintLabel ?? null,
      milestonePressureLabel: raw.delivery?.milestonePressureLabel ?? null,
    },
    capacity: {
      activeSprints: numberOrZero(raw.capacity?.activeSprints),
      totalCapacityPoints: numberOrZero(raw.capacity?.totalCapacityPoints),
      totalCommittedPoints: numberOrZero(raw.capacity?.totalCommittedPoints),
      totalRemainingPoints: numberOrZero(raw.capacity?.totalRemainingPoints),
      overloadedMembers: numberOrZero(raw.capacity?.overloadedMembers),
      underutilizedMembers: numberOrZero(raw.capacity?.underutilizedMembers),
      riskLevel: raw.capacity?.riskLevel ?? "LOW",
      rankedMembers: Array.isArray(raw.capacity?.rankedMembers)
        ? raw.capacity.rankedMembers.map((member) => ({
            userId: member.userId,
            name: member.name,
            assignedTasks: numberOrZero(member.assignedTasks),
            openTasks: numberOrZero(member.openTasks),
            completedTasks: numberOrZero(member.completedTasks),
            overdueTasks: numberOrZero(member.overdueTasks),
            workloadSharePercent: numberOrZero(member.workloadSharePercent),
            utilizationPercent: numberOrZero(member.utilizationPercent),
            committedPoints: numberOrZero(member.committedPoints),
            capacityPoints: numberOrZero(member.capacityPoints),
            loadStatus: member.loadStatus ?? "HEALTHY",
          }))
        : [],
    },
    ai: {
      estimateQuality: {
        completedTasksWithEstimates: numberOrZero(
          raw.ai?.estimateQuality?.completedTasksWithEstimates,
        ),
        estimateMaeHours: numberOrZero(raw.ai?.estimateQuality?.estimateMaeHours),
        onEstimateRatePercent: numberOrZero(
          raw.ai?.estimateQuality?.onEstimateRatePercent,
        ),
        qualityStatus: raw.ai?.estimateQuality?.qualityStatus ?? "WATCH",
        summary: raw.ai?.estimateQuality?.summary ?? "",
      },
      anomalies: Array.isArray(raw.ai?.anomalies)
        ? raw.ai.anomalies.map((anomaly) => ({
            code: anomaly.code,
            message: anomaly.message,
            severity: anomaly.severity,
            title: anomaly.title,
            targetType: anomaly.targetType,
            targetId: anomaly.targetId,
            ownerUserId: anomaly.ownerUserId,
            recommendedAction: anomaly.recommendedAction,
          }))
        : [],
      actions: Array.isArray(raw.ai?.actions)
        ? raw.ai.actions.map((action) => ({
            code: action.code,
            title: action.title,
            message: action.message,
            severity: action.severity,
            why: action.why,
            recommendedAction: action.recommendedAction,
            targetType: action.targetType,
            targetId: action.targetId,
            ownerUserId: action.ownerUserId,
          }))
        : [],
    },
    trends: {
      delivery: Array.isArray(raw.trends?.delivery)
        ? raw.trends.delivery.map((point) => ({
            label: point.label,
            completedTasks: numberOrZero(point.completedTasks),
            createdTasks: numberOrZero(point.createdTasks),
            overdueOpenTasks: numberOrZero(point.overdueOpenTasks),
          }))
        : [],
    },
  };
}
