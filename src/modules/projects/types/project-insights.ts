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
  title?: string;
  targetType?: "TASK" | "SPRINT" | "MILESTONE" | "USER" | "PROJECT";
  targetId?: string;
  ownerUserId?: string;
  recommendedAction?: string;
}

export interface ProjectAiInsights {
  projectId: string;
  metrics: ProjectAiMetrics;
  anomalies: ProjectAnomaly[];
  recommendations: string[];
}

export interface ProjectDashboardHealthDriver {
  key: string;
  label: string;
  impact: number;
  value: number;
  summary: string;
}

export interface ProjectDashboardHealth {
  score: number;
  status: "HEALTHY" | "WATCH" | "AT_RISK";
  summary: string;
  drivers: ProjectDashboardHealthDriver[];
}

export interface ProjectDashboardDelivery {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  stuckTasks: number;
  completionPercent: number;
  summary: string;
  activeSprintLabel?: string | null;
  milestonePressureLabel?: string | null;
}

export interface ProjectDashboardMemberLoad {
  userId: string;
  name: string;
  assignedTasks: number;
  openTasks: number;
  completedTasks: number;
  overdueTasks: number;
  workloadSharePercent: number;
  utilizationPercent: number;
  committedPoints: number;
  capacityPoints: number;
  loadStatus: "HEALTHY" | "WATCH" | "OVERLOADED" | "UNDERUTILIZED";
}

export interface ProjectDashboardCapacity {
  activeSprints: number;
  totalCapacityPoints: number;
  totalCommittedPoints: number;
  totalRemainingPoints: number;
  overloadedMembers: number;
  underutilizedMembers: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  rankedMembers: ProjectDashboardMemberLoad[];
}

export interface ProjectDashboardAiAction {
  code: string;
  title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  why: string;
  recommendedAction: string;
  targetType?: "TASK" | "SPRINT" | "MILESTONE" | "USER" | "PROJECT";
  targetId?: string;
  ownerUserId?: string;
}

export interface ProjectDashboardEstimateQuality {
  completedTasksWithEstimates: number;
  estimateMaeHours: number;
  onEstimateRatePercent: number;
  qualityStatus: "STRONG" | "WATCH" | "AT_RISK";
  summary: string;
}

export interface ProjectDashboardAi {
  estimateQuality: ProjectDashboardEstimateQuality;
  anomalies: ProjectAnomaly[];
  actions: ProjectDashboardAiAction[];
}

export interface ProjectDashboardTrendPoint {
  label: string;
  completedTasks: number;
  createdTasks: number;
  overdueOpenTasks: number;
}

export interface ProjectDashboardSnapshot {
  projectId: string;
  projectName: string;
  businessUnit?: string;
  projectType?: string;
  health: ProjectDashboardHealth;
  delivery: ProjectDashboardDelivery;
  capacity: ProjectDashboardCapacity;
  ai: ProjectDashboardAi;
  trends: {
    delivery: ProjectDashboardTrendPoint[];
  };
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
