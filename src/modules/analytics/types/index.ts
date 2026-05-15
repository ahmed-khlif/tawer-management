export interface ExecutiveAnalyticsOverview {
  totalProjects: number;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  activeSprints: number;
  totalProjectMembers: number;
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
