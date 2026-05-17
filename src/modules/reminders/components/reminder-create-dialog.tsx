"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useProjectMilestones from "@/modules/projects/hooks/milestones/use-project-milestones";
import useProjectSprints from "@/modules/projects/hooks/sprints/use-project-sprints";
import useProjectTasks from "@/modules/projects/hooks/tasks/use-project-tasks";
import { retrieveProjectById } from "@/modules/projects/services";
import useReminderUpload from "@/modules/reminders/hooks/use-reminder-upload";
import { ReminderChannelType, ReminderEntityType } from "@/modules/reminders/types";
import { reminderSchema, ReminderSchema } from "@/modules/reminders/validation/reminder.schema";
import { RecurrencePicker } from "./recurrence-picker";

interface ReminderCreateDialogProps {
  projectId: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  triggerClassName?: string;
  initialEntityType?: ReminderEntityType;
  initialEntityId?: string;
  initialEntityLabel?: string;
  defaultMessage?: string;
  lockEntity?: boolean;
}

const channels: ReminderChannelType[] = ["EMAIL", "PUSH", "TELEGRAM", "NTFY"];
const entityTypes: ReminderEntityType[] = ["PROJECT", "TASK", "SPRINT", "MILESTONE", "CUSTOM"];



export default function ReminderCreateDialog({
  projectId,
  triggerLabel = "Create reminder",
  triggerIcon,
  triggerVariant,
  triggerSize,
  triggerClassName,
  initialEntityType,
  initialEntityId,
  initialEntityLabel,
  defaultMessage,
  lockEntity = false,
}: ReminderCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: project } = useQuery({
    queryKey: ["project", projectId, "reminder-dialog"],
    queryFn: () => retrieveProjectById(projectId),
    enabled: !!projectId && open,
  });
  const { createReminder } = useReminderUpload(projectId);

  const projectLabel =
    project?.name || project?.contents?.[0]?.name || "Current project";

  const defaultEntityType = initialEntityType ?? "PROJECT";
  const defaultEntityId =
    initialEntityId ?? (defaultEntityType === "PROJECT" ? projectId : "");
  const wasOpenRef = useRef(false);

  const buildDefaultValues = (): ReminderSchema => ({
    userId: "",
    entityType: defaultEntityType,
    entityId: defaultEntityId,
    message: defaultMessage ?? "",
    reminderAt: new Date(Date.now() + 60 * 60 * 1000),
    isRecurring: false,
    recurrenceRule: "",
    channels: ["PUSH"],
  });

  const form = useForm<ReminderSchema>({
    resolver: zodResolver(reminderSchema),
    defaultValues: buildDefaultValues(),
  });

  const entityType = form.watch("entityType");
  const isRecurring = form.watch("isRecurring");
  const selectedChannels = form.watch("channels");

  const isAgile = project?.projectType === "AGILE";
  const { tasks } = useProjectTasks(projectId);
  const { sprints } = useProjectSprints(projectId, { enabled: isAgile });
  const milestonesQuery = useProjectMilestones(projectId);

  const taskOptions = useMemo(
    () =>
      (tasks ?? []).map((task) => ({
        id: task.id,
        label: `${(task as any).key ?? ""} ${task.title}`.trim() || task.title,
      })),
    [tasks],
  );
  const sprintOptions = useMemo(
    () => (sprints ?? []).map((sprint) => ({ id: sprint.id, label: sprint.name })),
    [sprints],
  );
  const milestoneOptions = useMemo(() => {
    const raw = milestonesQuery.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown })?.data)
        ? ((raw as { data: Array<{ id: string; name: string }> }).data)
        : [];
    return list.map((milestone) => ({
      id: milestone.id,
      label: milestone.name,
    }));
  }, [milestonesQuery.data]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      form.reset(buildDefaultValues());
    }
    wasOpenRef.current = open;
  }, [
    defaultEntityId,
    defaultEntityType,
    defaultMessage,
    form,
    open,
  ]);

  useEffect(() => {
    const firstMember = project?.members?.[0];
    if (!firstMember) return;
    if (!form.getValues("userId")) {
      form.setValue("userId", firstMember.userId);
    }
  }, [form, project?.members]);

  useEffect(() => {
    if (lockEntity) {
      if (form.getValues("entityType") !== defaultEntityType) {
        form.setValue("entityType", defaultEntityType);
      }
      if ((form.getValues("entityId") ?? "") !== defaultEntityId) {
        form.setValue("entityId", defaultEntityId);
      }
      return;
    }

    if (entityType === "PROJECT") {
      if ((form.getValues("entityId") ?? "") !== projectId) {
        form.setValue("entityId", projectId);
      }
    } else if (entityType === "CUSTOM") {
      if ((form.getValues("entityId") ?? "") !== "") {
        form.setValue("entityId", "");
      }
    } else if (entityType === "TASK") {
      const nextId = taskOptions[0]?.id ?? "";
      if ((form.getValues("entityId") ?? "") !== nextId) {
        form.setValue("entityId", nextId);
      }
    } else if (entityType === "SPRINT") {
      const nextId = sprintOptions[0]?.id ?? "";
      if ((form.getValues("entityId") ?? "") !== nextId) {
        form.setValue("entityId", nextId);
      }
    } else if (entityType === "MILESTONE") {
      const nextId = milestoneOptions[0]?.id ?? "";
      if ((form.getValues("entityId") ?? "") !== nextId) {
        form.setValue("entityId", nextId);
      }
    }
  }, [
    defaultEntityId,
    defaultEntityType,
    entityType,
    form,
    lockEntity,
    milestoneOptions,
    projectId,
    sprintOptions,
    taskOptions,
  ]);

  const lockedEntityTypeLabel =
    defaultEntityType === "CUSTOM" && initialEntityLabel?.toLowerCase().startsWith("epic")
      ? "EPIC"
      : defaultEntityType;

  const lockedEntityDisplay =
    initialEntityLabel ||
    (defaultEntityType === "PROJECT" ? projectLabel : defaultEntityId || "Linked entity");

  const handleSubmit = form.handleSubmit(async (values) => {
    await createReminder.mutateAsync({
      userId: values.userId,
      entityType: values.entityType,
      entityId: values.entityId,
      message: values.message,
      reminderAt: values.reminderAt,
      isRecurring: values.isRecurring,
      recurrenceRule: values.isRecurring ? values.recurrenceRule || undefined : undefined,
      channels: values.channels,
    });
    form.reset(buildDefaultValues());
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={triggerSize ?? "sm"}
          variant={triggerVariant}
          className={triggerClassName ? `${triggerClassName} gap-1.5` : "gap-1.5"}
        >
          {triggerIcon ?? <Plus className="size-4" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create reminder</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {project?.members?.map((member) => (
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

            {lockEntity ? (
              <div className="grid gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-2">
                <div className="space-y-1">
                  <FormLabel>Entity type</FormLabel>
                  <Input value={lockedEntityTypeLabel} disabled />
                </div>
                <div className="space-y-1">
                  <FormLabel>Entity</FormLabel>
                  <Input value={lockedEntityDisplay} disabled />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity</FormLabel>
                      <FormControl>
                        {entityType === "TASK" ? (
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select task" />
                            </SelectTrigger>
                            <SelectContent>
                              {taskOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : entityType === "SPRINT" ? (
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sprint" />
                            </SelectTrigger>
                            <SelectContent>
                              {sprintOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : entityType === "MILESTONE" ? (
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select milestone" />
                            </SelectTrigger>
                            <SelectContent>
                              {milestoneOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : entityType === "PROJECT" ? (
                          <Input value={projectLabel} disabled />
                        ) : (
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Custom identifier (optional)"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="What should the reminder say?" {...field} />
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

            <div className="space-y-3 rounded-xl border bg-muted/30 p-4 transition-all hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-semibold">Recurring reminder</FormLabel>
                  <p className="text-[11px] text-muted-foreground">Send this reminder on a schedule</p>
                </div>
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {isRecurring ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormField
                    control={form.control}
                    name="recurrenceRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RecurrencePicker 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <FormLabel>Channels</FormLabel>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => {
                  const selected = selectedChannels.includes(channel);
                  return (
                    <Button
                      key={channel}
                      type="button"
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

            <div className="flex justify-end">
              <Button type="submit" disabled={createReminder.isPending}>
                Create reminder
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
