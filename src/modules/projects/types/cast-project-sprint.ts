import {
  SprintInResponseType,
  SprintType,
  SprintContent,
  SprintEpicBreakdown,
} from "@/modules/projects/types/project-sprints";

export function castSprintToFrontend(raw: SprintInResponseType): SprintType {
  const content = raw.contents?.[0];

  const contents: SprintContent[] = (raw.contents || []).map((c) => ({
    id: c.id,
    sprintId: c.sprintId,
    name: c.name,
    unaccentedName: c.unaccentedName,
    description: c.description,
    details: c.details,
    language: c.language,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  }));

  return {
    id: raw.id,
    projectId: raw.projectId,
    createdById: raw.createdById,
    name: raw.name || content?.name || "Unnamed Sprint",
    description: raw.description ?? content?.description ?? undefined,
    details: content?.details,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
    estimatedStartDate: new Date(raw.estimatedStartDate),
    estimatedEndDate: new Date(raw.estimatedEndDate),
    status: raw.status,
    capacity: raw.capacity ?? null,
    contents,
    attachments: (raw.attachments || []).map((attachment) => ({
      id: attachment.id,
      attachment: attachment.attachment,
      createdAt: new Date(attachment.createdAt),
    })),
    tasks: (raw.tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      labels: task.labels,
    })),
    epicBreakdown: (raw.epicBreakdown || []).map(
      (epic): SprintEpicBreakdown => ({
        id: epic.id,
        title: epic.title,
        color: epic.color ?? null,
        taskCount: epic.taskCount,
        completedTaskCount: epic.completedTaskCount,
        progress: epic.progress,
      }),
    ),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}
