// ─── Enums ────────────────────────────────────────────────────────────────────

export enum EnumProjectTaskStatus {
  Backlog    = "BACKLOG",
  Todo       = "TODO",
  InProgress = "IN_PROGRESS",
  Testing    = "TESTING",
  InReview   = "IN_REVIEW",
  Done       = "DONE"
}

export enum EnumProjectTaskPriority {
  Urgent = "URGENT",
  High   = "HIGH",
  Medium = "MEDIUM",
  Low    = "LOW"
}

export enum EnumProjectTaskType {
  Story = "STORY",
  Task  = "TASK",
  Bug   = "BUG",
  Spike = "SPIKE",
  Epic  = "EPIC"
}

// ─── Custom Project Task Status ───────────────────────────────────────────────

export interface ProjectTaskStatusInResponse {
  id: string;
  projectId: string;
  name: string;
  color: string;
  displayOrder: number;
  isSystem: boolean;
  allowedTransitions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskStatus {
  id: string;
  projectId: string;
  name: string;
  color: string;
  displayOrder: number;
  isSystem: boolean;
  allowedTransitions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskStatusPayload {
  name: string;
  color?: string;
  displayOrder?: number;
  allowedTransitions?: string[];
}

export interface UpdateTaskStatusPayload {
  name?: string;
  color?: string;
  displayOrder?: number;
  allowedTransitions?: string[];
}

// ─── Task Labels ─────────────────────────────────────────────────────────────

export interface ProjectTaskLabelInResponse {
  id: string;
  projectId: string;
  name: string;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskLabel = ProjectTaskLabelInResponse;

export interface CreateTaskLabelPayload {
  name: string;
  color?: string;
}

export interface UpdateTaskLabelPayload {
  name?: string;
  color?: string | null;
}

// ─── Time Entries ────────────────────────────────────────────────────────────

export interface ProjectTaskTimeEntryInResponse {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  hours: number;
  description?: string | null;
  workSessionId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskTimeEntry = ProjectTaskTimeEntryInResponse;

export interface LogTimeEntryPayload {
  hours: number;
  description?: string;
  workSessionId?: string;
}

export interface UpdateTimeEntryPayload {
  hours?: number;
  description?: string;
}

// ─── Dependencies ────────────────────────────────────────────────────────────

export interface ProjectTaskDependencyInResponse {
  id: string;
  taskId: string;
  blockingTaskId: string;
  blockingTask?: {
    id: string;
    title: string;
    status: string;
    key?: string;
  };
  createdAt: string;
}

export type ProjectTaskDependency = ProjectTaskDependencyInResponse;

export interface AddDependencyPayload {
  blockingTaskId: string;
}

// ─── Task Comments ───────────────────────────────────────────────────────────

export interface ProjectTaskCommentInResponse {
  id: string;
  taskId?: string;
  content: string;
  authorId?: string;
  authorName?: string;
  likes?: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskComment = ProjectTaskCommentInResponse;

// ─── Subtasks ────────────────────────────────────────────────────────────────

export interface ProjectTaskSubTaskInResponse {
  id: string;
  key: string;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskSubTask = ProjectTaskSubTaskInResponse;

// ─── Attachments ─────────────────────────────────────────────────────────────

export interface ProjectTaskAttachmentInResponse {
  id: string;
  taskId?: string;
  url: string;
  attachment?: string;
  name?: string;
  createdAt: string;
}

export type ProjectTaskAttachment = ProjectTaskAttachmentInResponse;

export interface ProjectTaskAssigneeInResponse {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface ProjectTaskAssignee {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface ProjectTaskEpicSummaryInResponse {
  id: string;
  title: string;
  color?: string | null;
}

export interface ProjectTaskEpicSummary {
  id: string;
  title: string;
  color?: string | null;
}

// ─── Backend Response Shape (extended) ───────────────────────────────────────

export interface UserWorkloadSummary {
  userId: string;
  activeProjects: number;
  totalAssignedTasks: number;
  openTasks: number;
  completedTasks: number;
  overdueTasks: number;
  dueNext7Days: number;
  totalStoryPoints: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalLoggedHours: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface MyTaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  type?: string;
  sortBy?: string;
}

export interface MyTasksList {
  data: ProjectTaskType[];
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}

export interface ProjectTaskInResponseType {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  loggedHours?: number;
  progressPercent?: number;
  displayOrder?: number;
  assigneeId?: string;
  assignee?: ProjectTaskAssigneeInResponse | null;
  assigneeIds?: string[];
  reporterId?: string;
  milestoneId?: string;
  epicId?: string;
  epic?: ProjectTaskEpicSummaryInResponse | null;
  sprintId?: string;
  parentTaskId?: string;
  customStatusId?: string;
  customStatus?: ProjectTaskStatusInResponse | null;
  attachments?: Array<string | ProjectTaskAttachmentInResponse>;
  comments?: ProjectTaskCommentInResponse[];
  subTasks?: ProjectTaskSubTaskInResponse[];
  labels?: Array<{
    id: string;
    name: string;
    color: string | null;
  } | ProjectTaskLabelInResponse>;
  dependencies?: ProjectTaskDependencyInResponse[];
  timeEntries?: ProjectTaskTimeEntryInResponse[];
  blocked?: boolean;
  isFavorite?: boolean;
  archived?: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Frontend Shape ──────────────────────────────────────────────────────────

export interface ProjectTaskType {
  id: string;
  key: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  loggedHours?: number;
  progressPercent?: number;
  startDate?: string;
  dueDate?: string;
  displayOrder?: number;
  assigneeId?: string;
  assignee?: ProjectTaskAssignee | null;
  assigneeIds?: string[];
  reporterId?: string;
  milestoneId?: string;
  epicId?: string;
  epic?: ProjectTaskEpicSummary | null;
  sprintId?: string;
  parentTaskId?: string;
  customStatusId?: string;
  customStatus?: ProjectTaskStatus | null;
  attachments?: Array<string | ProjectTaskAttachment>;
  comments?: ProjectTaskComment[];
  subTasks?: ProjectTaskSubTask[];
  labels?: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  dependencies?: ProjectTaskDependency[];
  timeEntries?: ProjectTaskTimeEntry[];
  blocked?: boolean;
  isFavorite?: boolean;
  archived?: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Bulk / Move Payloads ────────────────────────────────────────────────────

export interface BulkUpdateStatusItem {
  taskId: string;
  status: string;
}

export interface BulkUpdateStatusPayload {
  tasks: BulkUpdateStatusItem[];
}

export interface MoveTaskInKanbanPayload {
  taskId: string;
  status: string;
  displayOrder?: number;
  epicId?: string | null;
}

export interface ReorderBacklogItem {
  taskId: string;
  displayOrder: number;
}

export interface ReorderBacklogPayload {
  tasks: ReorderBacklogItem[];
}

export interface MoveToSprintPayload {
  sprintId: string;
}
