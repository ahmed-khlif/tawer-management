export interface ProjectCapacityMember {
  userId: string;
  name: string;
  committedPoints: number;
  capacityPoints: number;
  remainingPoints: number;
  utilizationPercent: number;
  trackedWorkMinutes: number;
  isOverCapacity: boolean;
}

export interface ProjectCapacity {
  projectId: string;
  activeSprints: number;
  totalCapacityPoints: number;
  totalCommittedPoints: number;
  totalRemainingPoints: number;
  unassignedCommittedPoints: number;
  isOverCapacity: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  members: ProjectCapacityMember[];
}

export interface ProjectAiMetrics {
  completedTasksWithEstimates: number;
  estimateMaeHours: number;
  onEstimateRatePercent: number;
  blockedTasks: number;
}

export interface ProjectAnomaly {
  code: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface ProjectAiInsights {
  projectId: string;
  metrics: ProjectAiMetrics;
  anomalies: ProjectAnomaly[];
  recommendations: string[];
}

export interface ProjectReportOverview {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  stuckTasks: number;
  completionPercent: number;
  activeSprints: number;
  sprintStatusBreakdown: {
    pending: number;
    running: number;
  };
  milestones: {
    total: number;
    completed: number;
    completionPercent: number;
  };
}

export interface ProjectProductivityMember {
  userId: string;
  name: string;
  completedTasks: number;
  assignedTasks: number;
  completionRatePercent: number;
  loggedHours: number;
  productivityScore: number;
}

export interface ProjectProductivityMetrics {
  projectId: string;
  projectCompletionPercent: number;
  teamAverageProductivityScore: number;
  members: ProjectProductivityMember[];
}

export interface ProjectTeamWorkloadMember {
  userId: string;
  name: string;
  assignedTasks: number;
  openTasks: number;
  completedTasks: number;
  overdueTasks: number;
  storyPoints: number;
  loggedHours: number;
  workloadSharePercent: number;
}

export interface ProjectTeamWorkload {
  projectId: string;
  totalAssignedTasks: number;
  totalOpenTasks: number;
  totalCompletedTasks: number;
  totalLoggedHours: number;
  members: ProjectTeamWorkloadMember[];
}

export interface ProjectKanbanSettingsResponse {
  projectId: string;
  kanbanSettings?: Record<string, number> | null;
}

export interface UpdateProjectKanbanSettingsDto {
  settings?: Record<string, number> | null;
}
