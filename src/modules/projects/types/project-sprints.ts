// ─── Enums ────────────────────────────────────────────────────────────────────

export type SprintStatus = "Pending" | "Running" | "Stopped" | "Completed";

export type SprintLanguage = "Arabic" | "French" | "English";

// ─── Backend Response Shape ───────────────────────────────────────────────────

export interface SprintContentInResponse {
  id: string;
  sprintId: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface SprintTaskSummaryInResponse {
  id: string;
  title: string;
  status: string;
  labels: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface SprintAttachmentInResponse {
  id: string;
  attachment: string;
  createdAt: string | Date;
}

export interface SprintInResponseType {
  id: string;
  projectId: string;
  createdById: string;
  name?: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  status: SprintStatus;
  capacity?: number | null;
  contents?: SprintContentInResponse[];
  attachments?: SprintAttachmentInResponse[];
  tasks?: SprintTaskSummaryInResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── Mutation Payload Types ───────────────────────────────────────────────────

export interface SprintContentPayload {
  id?: string;
  name: string;
  description?: string;
  details?: string;
  language?: SprintLanguage;
}

export interface CreateSprintPayload {
  startDate: string;
  endDate: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  status?: SprintStatus;
  capacity?: number;
  content: SprintContentPayload[];
  aiSuggestCapacity?: boolean;
  aiSuggestPlanning?: boolean;
}

export interface UpdateSprintPayload {
  startDate?: string;
  endDate?: string;
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  status?: SprintStatus;
  capacity?: number;
  content?: SprintContentPayload[];
}

export interface CreatedSprintAiResponse {
  id: string;
  aiCapacitySignal?: SprintAiCapacitySignal;
  aiPlanningRecommendation?: import("@/modules/ai/types").AiPlanningRecommendation;
}

// ─── Frontend Shape ───────────────────────────────────────────────────────────

export interface SprintContent {
  id: string;
  sprintId: string;
  name: string;
  unaccentedName?: string;
  description?: string;
  details?: string | null;
  language?: SprintLanguage;
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintType {
  id: string;
  projectId: string;
  createdById: string;
  name: string;
  description?: string;
  details?: string | null;
  startDate: Date;
  endDate: Date;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  status: SprintStatus;
  capacity?: number | null;
  contents?: SprintContent[];
  attachments?: SprintAttachment[];
  tasks?: SprintTaskSummary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SprintTaskSummary {
  id: string;
  title: string;
  status: string;
  labels: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

export interface SprintAttachment {
  id: string;
  attachment: string;
  createdAt: Date;
}

export type SprintSummary = SprintType;
export type SprintDetail = SprintType;

export interface BurndownDataPoint {
  date: string;
  idealRemaining: number;
  actualRemaining: number | null;
  completed: number;
  added: number;
}

export interface SprintBurndown {
  sprintId: string;
  sprintName: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  completionPercentage: number;
  chartData: BurndownDataPoint[];
  totalTasks: number;
  completedTasks: number;
}

export interface SprintVelocityItem {
  sprintId: string;
  name: string;
  completedPoints: number;
  capacity: number | null;
}

export interface SprintVelocity {
  sprints: SprintVelocityItem[];
  totalCompletedSprints: number;
  totalCompletedPoints: number;
  averageVelocity: number;
}

export interface SprintAiCapacitySignal {
  sprintId: string;
  projectId: string;
  sprintCapacity: number;
  committedStoryPoints: number;
  utilizationPercent: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  relatedAnomalies: Array<{
    code: string;
    message: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
  }>;
  recommendations: string[];
}
