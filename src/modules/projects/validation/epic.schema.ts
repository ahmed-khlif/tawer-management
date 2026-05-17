import { z } from "zod";

const nullableIsoDate = z.string().datetime().optional().or(z.literal("")).transform((value) => value || undefined);

const epicSchemaFields = z.object({
  name: z.string().min(1, "Epic name is required").max(200, "Epic name is too long"),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a valid hex color")
    .optional()
    .or(z.literal("")),
  sprintId: z.string().uuid("Select a sprint for this epic"),
  startDate: nullableIsoDate,
  endDate: nullableIsoDate,
  aiSuggestTimeline: z.boolean().optional(),
  taskIds: z.array(z.string()).optional(),
});


export const createEpicSchema = epicSchemaFields.refine(
  (value) => {
    if (!value.startDate || !value.endDate) return true;
    return new Date(value.endDate) >= new Date(value.startDate);
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export const updateEpicSchema = epicSchemaFields.partial().refine(
  (value) => {
    if (!value.startDate || !value.endDate) return true;
    return new Date(value.endDate) >= new Date(value.startDate);
  },
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);

export type CreateEpicSchema = z.infer<typeof createEpicSchema>;
export type UpdateEpicSchema = z.infer<typeof updateEpicSchema>;
