import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  cancelReminder,
  createReminder,
  deleteReminder,
  dismissReminder,
  updateReminder,
} from "@/modules/reminders/services/reminders";
import { CreateReminderDto, UpdateReminderDto } from "@/modules/reminders/types";

export function useReminderUpload(projectId?: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    if (projectId) {
      await queryClient.invalidateQueries({
        queryKey: ["project-reminders", projectId],
      });
    }
    await queryClient.invalidateQueries({
      queryKey: ["my-reminders"],
    });
  };

  return {
    createReminder: useMutation({
      mutationFn: (data: CreateReminderDto) => {
        if (!projectId) throw new Error("Project reminder creation requires a projectId.");
        return createReminder(projectId, data);
      },
      onSuccess: async () => {
        await invalidate();
        toast.success("Reminder created successfully.");
      },
      onError: () => toast.error("Failed to create reminder."),
    }),
    updateReminder: useMutation({
      mutationFn: ({
        reminderId,
        data,
      }: {
        reminderId: string;
        data: UpdateReminderDto;
      }) => {
        if (!projectId) throw new Error("Project reminder update requires a projectId.");
        return updateReminder(projectId, reminderId, data);
      },
      onSuccess: async () => {
        await invalidate();
        toast.success("Reminder updated successfully.");
      },
      onError: () => toast.error("Failed to update reminder."),
    }),
    deleteReminder: useMutation({
      mutationFn: (reminderId: string) => {
        if (!projectId) throw new Error("Project reminder deletion requires a projectId.");
        return deleteReminder(projectId, reminderId);
      },
      onSuccess: async () => {
        await invalidate();
        toast.success("Reminder deleted successfully.");
      },
      onError: () => toast.error("Failed to delete reminder."),
    }),
    cancelReminder: useMutation({
      mutationFn: (reminderId: string) => {
        if (!projectId) throw new Error("Project reminder cancellation requires a projectId.");
        return cancelReminder(projectId, reminderId);
      },
      onSuccess: async () => {
        await invalidate();
        toast.success("Reminder cancelled.");
      },
      onError: () => toast.error("Failed to cancel reminder."),
    }),
    dismissReminder: useMutation({
      mutationFn: (reminderId: string) => dismissReminder(reminderId),
      onSuccess: async () => {
        await invalidate();
        toast.success("Reminder dismissed.");
      },
      onError: () => toast.error("Failed to dismiss reminder."),
    }),
  };
}

export default useReminderUpload;
