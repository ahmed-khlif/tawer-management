export type ReminderEntityType =
  | "TASK"
  | "SPRINT"
  | "MILESTONE"
  | "PROJECT"
  | "CUSTOM";

export type ReminderStatus = "PENDING" | "SENT" | "DISMISSED" | "FAILED";

export type ReminderChannelType =
  | "EMAIL"
  | "PUSH"
  | "TELEGRAM"
  | "NTFY";

export interface ReminderUser {
  id: string;
  name: string;
  email: string;
}

export interface ReminderCreator {
  id: string;
  name: string;
}

export interface ReminderChannel {
  id: string;
  channel: ReminderChannelType;
}

export interface ReminderSummary {
  id: string;
  entityType: ReminderEntityType;
  entityId?: string | null;
  message?: string | null;
  reminderAt: string | Date;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  status: ReminderStatus;
  sentAt?: string | Date | null;
  createdAt: string | Date;
  user: ReminderUser;
}

export interface ReminderDetail {
  id: string;
  userId: string;
  entityType: ReminderEntityType;
  entityId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  milestoneId?: string | null;
  message?: string | null;
  reminderAt: string | Date;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  createdById: string;
  status: ReminderStatus;
  sentAt?: string | Date | null;
  dismissedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: ReminderUser;
  createdBy: ReminderCreator;
  channels: ReminderChannel[];
}

export interface ReminderList {
  data: ReminderSummary[];
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}

export interface CreateReminderDto {
  userId: string;
  entityType: ReminderEntityType;
  entityId?: string;
  message?: string;
  reminderAt: Date;
  isRecurring?: boolean;
  recurrenceRule?: string;
  channels?: ReminderChannelType[];
}

export interface UpdateReminderDto {
  message?: string;
  reminderAt?: Date;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface ReminderQueryParams {
  page?: number;
  limit?: number;
  status?: ReminderStatus;
  entityType?: ReminderEntityType;
  reminderAtFrom?: string;
  reminderAtTo?: string;
  sortBy?: string;
}
