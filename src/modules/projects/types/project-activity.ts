import type { PaginationType } from "@/types/pagination";

export const PROJECT_ACTIVITY_TYPES = {
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_STATUS_CHANGED: "TASK_STATUS_CHANGED",
  TASK_COMMENT_ADDED: "TASK_COMMENT_ADDED",
  TASK_COMMENT_LIKED: "TASK_COMMENT_LIKED",
  SPRINT_CREATED: "SPRINT_CREATED",
  SPRINT_UPDATED: "SPRINT_UPDATED",
  EPIC_CREATED: "EPIC_CREATED",
  EPIC_UPDATED: "EPIC_UPDATED",
  MILESTONE_CREATED: "MILESTONE_CREATED",
  MILESTONE_UPDATED: "MILESTONE_UPDATED",
  MILESTONE_COMPLETED: "MILESTONE_COMPLETED",
  REMINDER_CREATED: "REMINDER_CREATED",
  REMINDER_CANCELLED: "REMINDER_CANCELLED",
  REMINDER_DISMISSED: "REMINDER_DISMISSED",
  PROJECT_MEMBER_ADDED: "PROJECT_MEMBER_ADDED",
  PROJECT_MEMBER_REMOVED: "PROJECT_MEMBER_REMOVED",
  PROJECT_INVITATION_CREATED: "PROJECT_INVITATION_CREATED",
  PROJECT_INVITATION_ACCEPTED: "PROJECT_INVITATION_ACCEPTED",
} as const;

export type ProjectActivityType =
  (typeof PROJECT_ACTIVITY_TYPES)[keyof typeof PROJECT_ACTIVITY_TYPES];

export type ProjectActivityTargetType =
  | "PROJECT"
  | "TASK"
  | "TASK_COMMENT"
  | "SPRINT"
  | "EPIC"
  | "MILESTONE"
  | "REMINDER"
  | "MEMBER"
  | "INVITATION";

export interface ProjectActivityActor {
  id?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface ProjectActivityProjectRef {
  id: string;
  name: string;
}

export interface ProjectActivityItemInResponse {
  id: string;
  type: ProjectActivityType;
  occurredAt: string;
  actor: ProjectActivityActor;
  project: ProjectActivityProjectRef;
  targetType: ProjectActivityTargetType;
  targetId?: string | null;
  targetLabel: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

export interface ProjectActivityItem {
  id: string;
  type: ProjectActivityType;
  occurredAt: Date;
  actor: ProjectActivityActor;
  project: ProjectActivityProjectRef;
  targetType: ProjectActivityTargetType;
  targetId?: string | null;
  targetLabel: string;
  summary: string;
  metadata?: Record<string, unknown> | null;
}

export interface ProjectActivityFilters {
  page?: number;
  limit?: number;
  startDateFrom?: string;
  endDateTo?: string;
  projectIds?: string[];
  actorIds?: string[];
  actorName?: string;
  types?: ProjectActivityType[];
  search?: string;
}

export interface ProjectActivityListResponse {
  data: ProjectActivityItem[];
  pagination: PaginationType;
}

export function castProjectActivityItem(
  activity: ProjectActivityItemInResponse,
): ProjectActivityItem {
  return {
    ...activity,
    occurredAt: new Date(activity.occurredAt),
  };
}
