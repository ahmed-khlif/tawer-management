"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { retrieveProjectById } from "@/modules/projects/services";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import { ReminderChannelType, ReminderEntityType } from "@/modules/reminders/types";
import { reminderSchema, ReminderSchema } from "@/modules/reminders/validation/reminder.schema";

const CHANNELS: ReminderChannelType[] = ["EMAIL", "PUSH", "TELEGRAM", "NTFY"];

interface SetReminderButtonProps {
  projectId: string;
  entityType: ReminderEntityType;
  entityId?: string;
  entityLabel?: string;
  defaultMessage?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  triggerLabel?: string;
}

export function SetReminderButton({
  projectId,
  entityType,
  entityId,
  entityLabel,
  defaultMessage,
  variant = "outline",
  size = "sm",
  className,
  triggerLabel = "Set reminder",
}: SetReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: project } = useQuery({
    queryKey: ["project", projectId, "set-reminder"],
    queryFn: () => retrieveProjectById(projectId),
    enabled: open,
  });
  const { createReminder } = useReminderUpload(projectId);

  const form = useForm<ReminderSchema>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      userId: "",
      entityType,
      entityId: entityId ?? (entityType === "PROJECT" ? projectId : ""),
      message: defaultMessage ?? "",
      reminderAt: new Date(Date.now() + 60 * 60 * 1000),
      isRecurring: false,
      recurrenceRule: "",
      channels: ["PUSH"],
    },
  });

  useEffect(() => {
    const firstMember = project?.members?.[0];
    if (firstMember && !form.getValues("userId")) {
      form.setValue("userId", firstMember.userId);
    }
  }, [form, project?.members]);

  const onSubmit = form.handleSubmit(async (values) => {
    await createReminder.mutateAsync({
      userId: values.userId,
      entityType: values.entityType,
      entityId: values.entityId || undefined,
      message: values.message,
      reminderAt: values.reminderAt,
      isRecurring: values.isRecurring,
      recurrenceRule: values.recurrenceRule || undefined,
      channels: values.channels,
    });
    form.reset({
      userId: form.getValues("userId"),
      entityType,
      entityId: entityId ?? (entityType === "PROJECT" ? projectId : ""),
      message: defaultMessage ?? "",
      reminderAt: new Date(Date.now() + 60 * 60 * 1000),
      isRecurring: false,
      recurrenceRule: "",
      channels: ["PUSH"],
    });
    setOpen(false);
  });

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)} type="button">
        <Bell className="mr-2 size-4" />
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Set a reminder</DialogTitle>
            {entityLabel ? (
              <DialogDescription>For {entityLabel}</DialogDescription>
            ) : null}
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notify</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(project?.members ?? []).map((member) => (
                          <SelectItem key={member.id} value={member.userId}>
                            {member.memberName || member.user?.name || member.userId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                        onChange={(event) => field.onChange(new Date(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Recurring</FormLabel>
                      <p className="text-xs text-muted-foreground">Send this reminder on a schedule.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("isRecurring") ? (
                <FormField
                  control={form.control}
                  name="recurrenceRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence rule (RRULE)</FormLabel>
                      <FormControl>
                        <Input placeholder="FREQ=DAILY;INTERVAL=1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <div className="space-y-2">
                <FormLabel>Channels</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((channel) => {
                    const selected = form.watch("channels").includes(channel);
                    return (
                      <Button
                        key={channel}
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        onClick={() => {
                          const current = form.getValues("channels");
                          const next = selected
                            ? current.filter((item) => item !== channel)
                            : [...current, channel];
                          form.setValue("channels", next, { shouldValidate: true });
                        }}
                      >
                        {channel}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createReminder.isPending}>
                  Save reminder
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SetReminderButton;
