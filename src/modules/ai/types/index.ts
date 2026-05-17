export interface PredictTaskDurationDto {
  taskId: string;
}

export interface ImproveDescriptionDto {
  entityType: string;
  title?: string;
  description?: string;
  projectId?: string;
}

export interface ImproveDescriptionResult {
  improvedDescription: string;
  rationale?: string;
}

export interface SmartAssignmentDto {
  projectId: string;
  taskType: string;
  taskPriority: string;
  taskTitle?: string;
}

export interface PredictionOutcomeFeedbackDto {
  taskId: string;
  actualHours: number;
}

export interface PredictionResult {
  predictedHours: number;
  confidence: number;
  reasonCodes: string[];
  riskFlags: string[];
}

export interface AssignmentCandidate {
  userId: string;
  userName: string | null;
  totalScore: number;
  workloadScore: number;
  historicalFitScore: number;
  availabilityScore: number;
  rationale: string | null;
}

export interface SmartAssignmentResult {
  recommendations: AssignmentCandidate[];
}

export interface ProjectAnomaly {
  code: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface ProjectAnomaliesResult {
  anomalies: ProjectAnomaly[];
}

export interface AiProjectMetrics {
  completedTasksWithEstimates: number;
  estimateMaeHours: number;
  onEstimateRatePercent: number;
  blockedTasks: number;
}

export interface PredictionOutcomeFeedbackResult {
  taskId: string;
  estimatedHours: number;
  actualHours: number;
  absoluteErrorHours: number;
}

export interface ProjectAiInsights {
  projectId: string;
  metrics: AiProjectMetrics;
  anomalies: ProjectAnomaly[];
  recommendations: string[];
}

export interface AiBlockerRisk {
  level: "LOW" | "MEDIUM" | "HIGH";
  flags: string[];
}

export interface AiTimelineSuggestion {
  suggestedStartDate: string | null;
  suggestedEndDate: string | null;
  riskNote: string;
}

export interface AiDueDateSuggestion {
  suggestedDueDate: string | null;
  criticalPathWarning: string;
}

export interface AiRoadmapRecommendation {
  suggestedMilestones: string[];
  suggestedEpics: string[];
  rationale: string;
}

export interface AiPlanningRecommendation {
  includeTaskIds: string[];
  excludeTaskIds: string[];
  rationale: string;
}

export type AiRiskLevel = "LOW" | "MEDIUM" | "HIGH";
