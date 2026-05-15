import { z } from "zod";

export const reminderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  entityType: z.enum(["TASK", "SPRINT", "MILESTONE", "PROJECT", "CUSTOM"]),
  entityId: z.string().optional(),
  message: z.string().max(500, "Reminder message is too long").optional(),
  reminderAt: z.date(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  channels: z
    .array(z.enum(["EMAIL", "PUSH", "TELEGRAM", "NTFY"]))
    .min(1, "Select at least one channel"),
});

export type ReminderSchema = z.infer<typeof reminderSchema>;
