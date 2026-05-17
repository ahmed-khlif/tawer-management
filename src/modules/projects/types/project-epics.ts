import { ProjectTaskType } from "./project-tasks";

export interface EpicTaskSummary {
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

export interface EpicSummary {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  sprintId?: string | null;
  sprintName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string | Date;
  tasks?: EpicTaskSummary[];
  totalTasks: number;
  doneTasks: number;
  taskCount: number;
  completedTaskCount: number;
  progress: number;
  aiRiskLevel?: import("@/modules/ai/types").AiRiskLevel;
  aiRecommendations?: string[];
  aiTimelineSuggestion?: import("@/modules/ai/types").AiTimelineSuggestion;
}

export type Epic = EpicSummary;

export interface EpicList {
  data: EpicSummary[];
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}

export interface CreateEpicDto {
  name: string;
  description?: string | null;
  color?: string | null;
  sprintId: string;
  startDate?: string | null;
  endDate?: string | null;
  aiSuggestTimeline?: boolean;
  taskIds?: string[];
}

export interface UpdateEpicDto {
  name?: string | null;
  description?: string | null;
  color?: string | null;
  sprintId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  aiSuggestTimeline?: boolean;
  taskIds?: string[];
}


export interface EpicAiResponse {
  id: string;
  aiRiskLevel?: import("@/modules/ai/types").AiRiskLevel;
  aiRecommendations?: string[];
  aiTimelineSuggestion?: import("@/modules/ai/types").AiTimelineSuggestion;
}

export interface EpicQueryParams {
  sprintId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface EpicDetailSheetState {
  epic: Epic | null;
  relatedTasks: ProjectTaskType[];
}
