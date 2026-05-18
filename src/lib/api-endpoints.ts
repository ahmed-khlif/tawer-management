const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

export const API = {
  BASE_URL: API_BASE_URL,
  PROJECTS: {
    LIST: () => buildUrl("/projects"),
    STATUS_COUNTS: () => buildUrl("/projects/status-counts"),
    CREATE: () => buildUrl("/projects/register"),
    ROADMAP_PREVIEW: () => buildUrl("/projects/ai/roadmap-preview"),
    DETAIL: (projectId: string) => buildUrl(`/projects/${projectId}`),
    UPDATE: (projectId: string) => buildUrl(`/projects/${projectId}`),
    DELETE: (projectId: string) => buildUrl(`/projects/${projectId}`),
    ARCHIVE: (projectId: string) => buildUrl(`/projects/${projectId}/archive`),
    RESTORE: (projectId: string) => buildUrl(`/projects/${projectId}/restore`),
    CAPACITY: (projectId: string) => buildUrl(`/projects/${projectId}/capacity`),
    CALENDAR: (projectId: string) => buildUrl(`/projects/${projectId}/calendar`),
    AI_INSIGHTS: (projectId: string) => buildUrl(`/projects/${projectId}/ai/insights`),
    REPORT_OVERVIEW: (projectId: string) =>
      buildUrl(`/projects/${projectId}/reports/overview`),
    REPORT_SNAPSHOT: (projectId: string) =>
      buildUrl(`/projects/${projectId}/reports/snapshot`),
    TEAM_WORKLOAD: (projectId: string) =>
      buildUrl(`/projects/${projectId}/reports/team-workload`),
    PRODUCTIVITY: (projectId: string) =>
      buildUrl(`/projects/${projectId}/reports/productivity`),
    KANBAN_SETTINGS: (projectId: string) =>
      buildUrl(`/projects/${projectId}/kanban/settings`),
    ACTIVITY: () => buildUrl('/activity/projects'),
    MEMBERS: (projectId: string) => buildUrl(`/projects/${projectId}/members`),
    MEMBER: (projectId: string, memberId: string) =>
      buildUrl(`/projects/${projectId}/members/${memberId}`),
    INVITATIONS: (projectId: string) =>
      buildUrl(`/projects/${projectId}/invitations`),
    INVITATION: (projectId: string, invitationId: string) =>
      buildUrl(`/projects/${projectId}/invitations/${invitationId}`),
    RESEND_INVITATION: (projectId: string, invitationId: string) =>
      buildUrl(`/projects/${projectId}/invitations/${invitationId}/resend`),
    ACCEPT_INVITATION: () => buildUrl("/projects/invitations/accept"),
  },
  SPRINTS: {
    LIST: (projectId: string) => buildUrl(`/projects/${projectId}/sprints`),
    CREATE: (projectId: string) => buildUrl(`/projects/${projectId}/sprints`),
    AI_PREVIEW: (projectId: string) => buildUrl(`/projects/${projectId}/sprints/ai-preview`),
    DETAIL: (sprintId: string) => buildUrl(`/sprints/${sprintId}`),
    UPDATE: (sprintId: string) => buildUrl(`/projects/sprints/${sprintId}`),
    DELETE: (sprintId: string) => buildUrl(`/projects/sprints/${sprintId}`),
    BURNDOWN: (sprintId: string) => buildUrl(`/sprints/${sprintId}/burndown`),
    VELOCITY: (projectId: string) => buildUrl(`/projects/${projectId}/velocity`),
    ATTACHMENTS: (projectId: string, sprintId: string) =>
      buildUrl(`/projects/${projectId}/sprints/${sprintId}/attachments`),
    ATTACHMENT: (projectId: string, sprintId: string, attachmentId: string) =>
      buildUrl(`/projects/${projectId}/sprints/${sprintId}/attachments/${attachmentId}`),
    AI_CAPACITY_SIGNAL: (projectId: string, sprintId: string) =>
      buildUrl(`/projects/${projectId}/sprints/${sprintId}/ai/capacity-signal`),
  },
  EPICS: {
    LIST: (projectId: string) => buildUrl(`/projects/${projectId}/epics`),
    LIST_BY_SPRINT: (projectId: string, sprintId: string) =>
      buildUrl(`/projects/${projectId}/sprints/${sprintId}/epics`),
    CREATE: (projectId: string) => buildUrl(`/projects/${projectId}/epics`),
    AI_PREVIEW: (projectId: string) => buildUrl(`/projects/${projectId}/epics/ai-preview`),
    DETAIL: (projectId: string, epicId: string) =>
      buildUrl(`/projects/${projectId}/epics/${epicId}`),
    UPDATE: (projectId: string, epicId: string) =>
      buildUrl(`/projects/${projectId}/epics/${epicId}`),
    DELETE: (projectId: string, epicId: string) =>
      buildUrl(`/projects/${projectId}/epics/${epicId}`),
  },
  MILESTONES: {
    LIST: (projectId: string) => buildUrl(`/projects/${projectId}/milestones`),
    CREATE: (projectId: string) => buildUrl(`/projects/${projectId}/milestones`),
    AI_PREVIEW: (projectId: string) => buildUrl(`/projects/${projectId}/milestones/ai-preview`),
    DETAIL: (projectId: string, milestoneId: string) =>
      buildUrl(`/projects/${projectId}/milestones/${milestoneId}`),
    UPDATE: (projectId: string, milestoneId: string) =>
      buildUrl(`/projects/${projectId}/milestones/${milestoneId}`),
    DELETE: (projectId: string, milestoneId: string) =>
      buildUrl(`/projects/${projectId}/milestones/${milestoneId}`),
    COMPLETE: (projectId: string, milestoneId: string) =>
      buildUrl(`/projects/${projectId}/milestones/${milestoneId}/complete`),
    GANTT: (projectId: string) => buildUrl(`/projects/${projectId}/gantt`),
  },
  TASKS: {
    STATUSES: (projectId: string) => buildUrl(`/projects/${projectId}/task-statuses`),
    STATUS: (projectId: string, statusId: string) =>
      buildUrl(`/projects/${projectId}/task-statuses/${statusId}`),
    LIST: (projectId: string) => buildUrl(`/projects/${projectId}/tasks`),
    CREATE: (projectId: string) => buildUrl(`/projects/${projectId}/tasks`),
    AI_PREVIEW: (projectId: string) => buildUrl(`/projects/${projectId}/tasks/ai-preview`),
    DETAIL: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}`),
    UPDATE: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}`),
    DELETE: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}`),
    ATTACHMENTS: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/attachments`),
    ATTACHMENT: (projectId: string, taskId: string, attachmentId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`),
    BULK_STATUS: (projectId: string) =>
      buildUrl(`/projects/${projectId}/tasks/bulk-status`),
    KANBAN: (projectId: string) => buildUrl(`/projects/${projectId}/kanban`),
    MOVE_IN_KANBAN: (projectId: string) =>
      buildUrl(`/projects/${projectId}/kanban/move`),
    BACKLOG: (projectId: string) => buildUrl(`/projects/${projectId}/backlog`),
    REORDER_BACKLOG: (projectId: string) =>
      buildUrl(`/projects/${projectId}/backlog/reorder`),
    MOVE_TO_SPRINT: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/backlog/${taskId}/move-to-sprint`),
    COMMENTS: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/comments`),
    COMMENT: (projectId: string, taskId: string, commentId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
    LIKE_COMMENT: (projectId: string, taskId: string, commentId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}/like`),
    DEPENDENCIES: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/dependencies`),
    DEPENDENCY: (projectId: string, taskId: string, dependencyId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/dependencies/${dependencyId}`),
    TIME_ENTRIES: (projectId: string, taskId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/time-entries`),
    TIME_ENTRY: (projectId: string, taskId: string, timeEntryId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`),
    LABELS: (projectId: string) => buildUrl(`/projects/${projectId}/labels`),
    LABEL: (projectId: string, labelId: string) =>
      buildUrl(`/projects/${projectId}/labels/${labelId}`),
    ASSIGN_LABEL: (projectId: string, taskId: string, labelId: string) =>
      buildUrl(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`),
    TASKS_IN_SPRINT: (projectId: string, sprintId: string) =>
      buildUrl(`/projects/${projectId}/sprints/${sprintId}/tasks`),
    MY_PROJECT_TASKS: (projectId: string) =>
      buildUrl(`/projects/${projectId}/tasks/me`),
    MY_TASKS: () => buildUrl("/tasks/me"),
    MY_WORKLOAD_SUMMARY: () => buildUrl("/users/me/workload/summary"),
  },
  REMINDERS: {
    PROJECT_LIST: (projectId: string) => buildUrl(`/projects/${projectId}/reminders`),
    PROJECT_CREATE: (projectId: string) => buildUrl(`/projects/${projectId}/reminders`),
    PROJECT_DETAIL: (projectId: string, reminderId: string) =>
      buildUrl(`/projects/${projectId}/reminders/${reminderId}`),
    PROJECT_UPDATE: (projectId: string, reminderId: string) =>
      buildUrl(`/projects/${projectId}/reminders/${reminderId}`),
    PROJECT_DELETE: (projectId: string, reminderId: string) =>
      buildUrl(`/projects/${projectId}/reminders/${reminderId}`),
    PROJECT_CANCEL: (projectId: string, reminderId: string) =>
      buildUrl(`/projects/${projectId}/reminders/${reminderId}/cancel`),
    MY_REMINDERS: () => buildUrl("/reminders/me"),
    DISMISS: (reminderId: string) => buildUrl(`/reminders/${reminderId}/dismiss`),
  },
  ANALYTICS: {
    OVERVIEW: () => buildUrl("/analytics/overview"),
    OVERVIEW_SNAPSHOT: () => buildUrl("/analytics/overview/snapshot"),
    EMPLOYEE_METRICS: (userId: string) =>
      buildUrl(`/analytics/employees/${userId}/metrics`),
    EMPLOYEE_SUMMARY: (userId: string) =>
      buildUrl(`/analytics/employees/${userId}`),
    EMPLOYEE_SNAPSHOT: (userId: string) =>
      buildUrl(`/analytics/employees/${userId}/snapshot`),
  },
  AI: {
    PREDICT_TASK_DURATION: () => buildUrl("/ai/predict-task-duration"),
    IMPROVE_DESCRIPTION: () => buildUrl("/ai/improve-description"),
    SMART_ASSIGNMENT: () => buildUrl("/ai/smart-assignment"),
    PROJECT_METRICS: (projectId: string) => buildUrl(`/ai/metrics/${projectId}`),
    PREDICTION_FEEDBACK: () => buildUrl("/ai/feedback/prediction-outcome"),
    PROJECT_ANOMALIES: (projectId: string) =>
      buildUrl(`/ai/anomalies/${projectId}`),
  },
} as const;

export type ApiRegistry = typeof API;
