export type MilestoneGanttStatus =
  | "COMPLETED"
  | "OVERDUE"
  | "PENDING"
  | "IN_PROGRESS";

export interface MilestoneTaskSummary {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  type: string;
  priority: string;
  status: string;
  storyPoints?: number | null;
  dueDate?: string | Date | null;
  completedAt?: string | Date | null;
  createdAt: string | Date;
}

export interface MilestoneSummary {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  tasks?: MilestoneTaskSummary[];
  totalTasks: number;
  doneTasks: number;
  progress: number;
  aiRiskLevel?: import("@/modules/ai/types").AiRiskLevel;
  aiRecommendations?: string[];
  aiDueDateSuggestion?: import("@/modules/ai/types").AiDueDateSuggestion;
}

export type Milestone = MilestoneSummary;

export interface MilestoneList {
  data: MilestoneSummary[];
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}

export interface GanttMilestone {
  id: string;
  name: string;
  description?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  status: MilestoneGanttStatus;
}

export interface GanttEpic {
  id: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface GanttSprint {
  id: string;
  name?: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
}

export interface GanttTask {
  id: string;
  key: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  startDate?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  storyPoints?: number | null;
  epicId?: string | null;
  sprintId?: string | null;
  parentTaskId?: string | null;
  dependencyIds?: string[];
  createdAt: string;
}

export interface GanttChart {
  milestones: GanttMilestone[];
  epics: GanttEpic[];
  sprints: GanttSprint[];
  tasks: GanttTask[];
}

export interface CreateMilestoneDto {
  name: string;
  description?: string | null;
  dueDate?: string | null;
  aiSuggestDueDate?: boolean;
  taskIds?: string[];
}

export interface UpdateMilestoneDto {
  name?: string | null;
  description?: string | null;
  dueDate?: string | null;
  aiSuggestDueDate?: boolean;
  taskIds?: string[];
}


export interface MilestoneQueryParams {
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
