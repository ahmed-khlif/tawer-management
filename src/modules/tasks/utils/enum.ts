import { EnumTaskPriority, EnumTaskStatus } from "../types/tasks";

export const priorityClasses: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]: "pm-badge-priority-high border",
  [EnumTaskPriority.Medium]: "pm-badge-priority-medium border",
  [EnumTaskPriority.Low]: "pm-badge-priority-low border",
};

export const priorityDotColors: Record<EnumTaskPriority, string> = {
  [EnumTaskPriority.High]: "pm-dot-priority-high",
  [EnumTaskPriority.Medium]: "pm-dot-priority-medium",
  [EnumTaskPriority.Low]: "pm-dot-priority-low",
};

export const statusClasses: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]: "pm-badge-task-todo border",
  [EnumTaskStatus.InProgress]: "pm-badge-task-in-progress border",
  [EnumTaskStatus.Completed]: "pm-badge-task-done border",
};

export const taskStatusNamed: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]:    "Pending",
  [EnumTaskStatus.InProgress]: "In Progress",
  [EnumTaskStatus.Completed]:  "Completed"
};

export const statusDotColors: Record<EnumTaskStatus, string> = {
  [EnumTaskStatus.Pending]: "pm-dot-task-todo",
  [EnumTaskStatus.InProgress]: "pm-dot-task-in-progress",
  [EnumTaskStatus.Completed]: "pm-dot-task-done",
};

export const favoriteActiveClasses = "fill-primary text-primary";
