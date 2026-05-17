import type {
  AiBlockerRisk,
  AiDueDateSuggestion,
  AiPlanningRecommendation,
  AiRiskLevel,
  AiRoadmapRecommendation,
  AiTimelineSuggestion,
  AssignmentCandidate,
  PredictionResult,
} from "@/modules/ai/types";
import type { SprintAiCapacitySignal } from "@/modules/projects/types/project-sprints";

export interface ProjectRoadmapPreviewPayload {
  name: string;
  description?: string;
  projectType: string;
  businessUnit: string;
  startDate: string;
  endDate: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
}

export interface ProjectRoadmapPreviewResult {
  aiSuggestedDurationDays: number;
  aiRoadmapRecommendation: AiRoadmapRecommendation;
  suggestedEstimatedStartDate: string;
  suggestedEstimatedEndDate: string;
}

export interface TaskAiPreviewPayload {
  title: string;
  description?: string;
  type: string;
  priority: string;
  status?: string;
  storyPoints?: number;
  estimatedHours?: number;
  dueDate?: string;
  assigneeId?: string;
  milestoneId?: string;
  sprintId?: string;
  dependencyIds?: string[];
}

export interface TaskAiPreviewResult {
  assignmentRecommendations: AssignmentCandidate[];
  estimatePrediction: PredictionResult;
  blockerRisk: AiBlockerRisk;
}

export interface MilestoneAiPreviewPayload {
  name: string;
  description?: string;
  dueDate?: string;
  taskIds?: string[];
}

export interface MilestoneAiPreviewResult {
  aiRiskLevel?: AiRiskLevel;
  aiRecommendations?: string[];
  aiDueDateSuggestion?: AiDueDateSuggestion;
}

export interface EpicAiPreviewPayload {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  sprintId: string;
  taskIds?: string[];
}

export interface EpicAiPreviewResult {
  aiRiskLevel?: AiRiskLevel;
  aiRecommendations?: string[];
  aiTimelineSuggestion?: AiTimelineSuggestion;
}

export interface SprintAiPreviewPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  capacity?: number;
}

export interface SprintAiPreviewResult {
  aiCapacitySignal?: SprintAiCapacitySignal;
  aiPlanningRecommendation?: AiPlanningRecommendation;
  suggestedEstimatedStartDate?: string;
  suggestedEstimatedEndDate?: string;
}
