import { z } from "zod";

interface Params {
  t: (key: string) => string;
}

export const getProjectTaskFormSchema = ({ t }: Params) =>
  z.object({
    title: z.string().min(1, t("title.required")),
    description: z.string().optional(),
    type: z.enum(["STORY", "TASK", "BUG", "SPIKE", "EPIC"], {
      errorMap: () => ({ message: t("type.invalid") })
    }),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "IN_REVIEW", "DONE"], {
      errorMap: () => ({ message: t("status.invalid") })
    }),
    priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"], {
      errorMap: () => ({ message: t("priority.invalid") })
    }),
    storyPoints: z.coerce.number().min(0).optional(),
    estimatedHours: z.coerce.number().min(0).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    milestoneId: z.string().optional(),
    epicId: z.string().optional(),
    sprintId: z.string().optional(),
    parentTaskId: z.string().optional(),
    aiSuggestAssignee: z.boolean().optional(),
    aiSuggestEstimate: z.boolean().optional(),
    aiSuggestBlockerRisk: z.boolean().optional(),
    attachments: z.array(z.instanceof(File)).optional(),
    deletedAttachments: z.string().optional(),
  });

export type ProjectTaskFormSchema = z.infer<ReturnType<typeof getProjectTaskFormSchema>>;
