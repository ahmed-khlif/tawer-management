export interface ExecutiveAnalyticsOverview {
  totalProjects: number;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  activeSprints: number;
  totalProjectMembers: number;
}

export interface AnalyticsTrendPoint {
  label: string;
  value: number;
}

export interface ExecutiveRiskProject {
  projectId: string;
  projectName: string;
  businessUnit?: string;
  status: string;
  overdueTasks: number;
  openTasks: number;
  endDate?: string | null;
  summary: string;
}

export interface ExecutiveAnalyticsSnapshot {
  scopeLabel: string;
  completionTrend: AnalyticsTrendPoint[];
  overdueTrend: AnalyticsTrendPoint[];
  riskProjects: ExecutiveRiskProject[];
}

export interface EmployeeAnalyticsSummary {
  userId: string;
  userName: string | null;
  totalAssignedTasks: number;
  openAssignedTasks: number;
  completedAssignedTasks: number;
  totalStoryPointsAssigned: number;
  completedStoryPoints: number;
}

export interface EmployeeProductivityMetrics {
  userId: string;
  userName: string | null;
  hoursLogged: number;
  tasksCompleted: number;
  completedTasksWithDueDate: number;
  onTimeCompletedTasks: number;
  lateCompletedTasks: number;
  onTimeRatePercent: number | null;
}

export interface EmployeeAnalyticsSnapshot {
  userId: string;
  userName: string | null;
  workloadLabel: "Healthy Load" | "Watch" | "Overloaded";
  sharedProjectCount: number;
  completedTrend: AnalyticsTrendPoint[];
  onTimeTrend: AnalyticsTrendPoint[];
  workloadTrend: AnalyticsTrendPoint[];
}
