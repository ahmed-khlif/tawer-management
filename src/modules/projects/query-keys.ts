export const projectQueryKeys = {
  detail: (projectId: string) => ["project", projectId] as const,
  sprints: {
    list: (projectId: string, filters?: object) =>
      ["project-sprints", projectId, filters ?? {}] as const,
    detail: (sprintId: string) => ["sprint", sprintId] as const,
  },
  epics: {
    list: (projectId: string, filters?: object) =>
      ["project-epics", projectId, filters ?? {}] as const,
    detail: (projectId: string, epicId: string) =>
      ["project-epic", projectId, epicId] as const,
  },
  milestones: {
    list: (projectId: string, filters?: object) =>
      ["project-milestones", projectId, filters ?? {}] as const,
    detail: (projectId: string, milestoneId: string) =>
      ["project-milestone", projectId, milestoneId] as const,
    gantt: (projectId: string) => ["project-milestones-gantt", projectId] as const,
  },
  reminders: {
    list: (projectId: string, filters?: object) =>
      ["project-reminders", projectId, filters ?? {}] as const,
    mine: (filters?: object) =>
      ["my-reminders", filters ?? {}] as const,
  },
  tasks: {
    list: (projectId: string, filters?: object) =>
      ["project-tasks", projectId, filters ?? {}] as const,
    detail: (projectId: string, taskId: string) =>
      ["project-task", projectId, taskId] as const,
    myInProject: (projectId: string, filters?: object) =>
      ["project-my-tasks", projectId, filters ?? {}] as const,
    kanban: (projectId: string) =>
      ["project-kanban", projectId] as const,
  },
} as const;
