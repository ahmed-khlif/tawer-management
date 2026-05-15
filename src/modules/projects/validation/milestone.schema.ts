import { z } from "zod";

export const createMilestoneSchema = z.object({
  name: z.string().min(1, "Milestone name is required").max(200, "Milestone name is too long"),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  aiSuggestDueDate: z.boolean().optional(),
  taskIds: z.array(z.string()).optional(),
});


export const updateMilestoneSchema = createMilestoneSchema.partial();

export type CreateMilestoneSchema = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneSchema = z.infer<typeof updateMilestoneSchema>;
