import {
  ProjectTaskInResponseType,
  ProjectTaskType,
  ProjectTaskComment,
  ProjectTaskSubTask,
  ProjectTaskDependency,
} from "@/modules/projects/types/project-tasks";

/**
 * Coerce backend-returned id-like fields to strings.
 *
 * The backend declares fields like `assigneeId`, `epicId`, `sprintId`, …
 * as `string | null`. However, depending on the Prisma `select` shape and
 * class-transformer config, some endpoints occasionally leak the related
 * relation object (e.g. `{ id, userId }` for an assignee member, or
 * `{ id, name }` for an epic) into the id slot. Rendering an object as a
 * React child crashes the app with "Objects are not valid as a React child".
 * Defensive coercion keeps the UI alive even if the API drifts.
 */
function coerceId(value: unknown, fieldName?: string): string | undefined {
  if (typeof value === "string") return value || undefined;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (process.env.NODE_ENV !== "production") {
      // Surface the API drift loud and clear so we can fix the backend.
      // eslint-disable-next-line no-console
      console.warn(
        `[cast-project-task] expected string for ${fieldName ?? "id field"}, got object:`,
        obj,
      );
    }
    // Prefer `userId` first — for a leaked project-member shape `{id, userId}`,
    // the user UUID is what `assigneeId` is supposed to point at.
    if (typeof obj.userId === "string") return obj.userId;
    if (typeof obj.id === "string") return obj.id;
  }
  return undefined;
}

function coerceText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function castProjectTaskToFrontend(raw: ProjectTaskInResponseType): ProjectTaskType {
  const comments: ProjectTaskComment[] = (raw.comments || []).map((c) => ({
    id: coerceText(c.id),
    content: coerceText(c.content),
    authorId: coerceId(c.authorId, "comment.authorId"),
    authorName: coerceText(c.authorName, ""),
    likes: typeof c.likes === "number" ? c.likes : undefined,
    likedByMe: typeof c.likedByMe === "boolean" ? c.likedByMe : undefined,
    createdAt: coerceText(c.createdAt),
    updatedAt: coerceText(c.updatedAt),
  }));

  const subTasks: ProjectTaskSubTask[] = (raw.subTasks || []).map((s) => ({
    id: coerceText(s.id),
    key: coerceText(s.key),
    title: coerceText(s.title, "Untitled subtask"),
    status: coerceText(s.status),
    priority: coerceText(s.priority),
    assigneeId: coerceId(s.assigneeId, "subTask.assigneeId"),
    createdAt: coerceText(s.createdAt),
    updatedAt: coerceText(s.updatedAt),
  }));

  const dependencies: ProjectTaskDependency[] = (raw.dependencies ?? []).map((dependency) => ({
    id: coerceText(dependency.id),
    taskId: coerceText(dependency.taskId),
    blockingTaskId: coerceId(dependency.blockingTaskId, "dependency.blockingTaskId") ?? "",
    blockingTask: dependency.blockingTask
      ? {
          id: coerceText(dependency.blockingTask.id),
          title: coerceText(dependency.blockingTask.title, "Untitled task"),
          status: coerceText(dependency.blockingTask.status),
          key: coerceText(dependency.blockingTask.key, ""),
        }
      : undefined,
    createdAt: coerceText(dependency.createdAt),
  }));

  // Backend label shape varies by endpoint:
  //   - Flattened (kanban):    [{ id, name, color }]
  //   - Joined (task list):    [{ label: { id, name, color } }]
  // Normalize both into the flat shape the UI expects.
  const labels = (raw.labels ?? [])
    .map((entry: any) => {
      const source =
        entry && typeof entry === "object" && "label" in entry && entry.label
          ? entry.label
          : entry;
      if (!source || typeof source !== "object") return null;
      const id = typeof source.id === "string" ? source.id : "";
      const name = typeof source.name === "string" ? source.name : "";
      if (!id || !name) return null;
      return {
        id,
        name,
        color: typeof source.color === "string" ? source.color : null,
      };
    })
    .filter((l): l is { id: string; name: string; color: string | null } => !!l);

  return {
    id: coerceText(raw.id),
    key: coerceText(raw.key),
    title: coerceText(raw.title, "Untitled task"),
    description: coerceText(raw.description, ""),
    type: coerceText(raw.type),
    status: coerceText(raw.status),
    priority: coerceText(raw.priority),
    storyPoints: raw.storyPoints,
    estimatedHours: raw.estimatedHours,
    actualHours: raw.actualHours,
    progressPercent: raw.progressPercent,
    dueDate: raw.dueDate,
    assigneeId: coerceId(raw.assigneeId, "assigneeId"),
    reporterId: coerceId(raw.reporterId, "reporterId"),
    milestoneId: coerceId(raw.milestoneId, "milestoneId"),
    epicId: coerceId(raw.epicId, "epicId"),
    sprintId: coerceId(raw.sprintId, "sprintId"),
    parentTaskId: coerceId(raw.parentTaskId, "parentTaskId"),
    attachments: raw.attachments,
    labels: labels.length > 0 ? labels : undefined,
    dependencies: dependencies.length > 0 ? dependencies : undefined,
    timeEntries: raw.timeEntries,
    isFavorite: raw.isFavorite,
    archived: raw.archived,
    comments,
    subTasks,
    projectId: coerceText(raw.projectId),
    createdAt: coerceText(raw.createdAt),
    updatedAt: coerceText(raw.updatedAt),
  };
}
