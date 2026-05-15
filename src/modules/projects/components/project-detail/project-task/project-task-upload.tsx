"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimeInput from "@/components/time-input";
import TextEditor from "@/components/ui/text-editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { DotBadgeSelectItem } from "../../shared/dot-badge-option";
import { ProjectTaskType, EnumProjectTaskType, EnumProjectTaskStatus, EnumProjectTaskPriority } from "@/modules/projects/types/project-tasks";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import useProject from "../../../hooks/projects/use-project";
import useProjectEpics from "../../../hooks/epics/use-project-epics";
import useProjectMilestones from "../../../hooks/milestones/use-project-milestones";
import useProjectSprints from "../../../hooks/sprints/use-project-sprints";
import { retrieveProjectTasksPaginated } from "../../../services/api/project-tasks";
import { projectTaskStatusDotColors, projectTaskPriorityDotColors, projectTaskTypeDotColors } from "../../../utils/badges/project-task-badges";
import AttachementUpload from "@/modules/projects/components/project-detail/project-task/attachments";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTaskType | null;
  isAgile: boolean;
}

export default function ProjectTaskUploadSheet({
  projectId,
  isOpen,
  onClose,
  task,
  isAgile
}: Props) {
  const t = useTranslations("modules.projects.tasks");

  const [resetFilesTrigger, setResetFilesTrigger] = React.useState(0);
  const { project } = useProject(projectId);
  const epicsQuery = useProjectEpics(
    projectId,
    { page: 1, limit: 100, sortBy: "createdAtDesc" },
    { enabled: isAgile && isOpen },
  );
  const milestonesQuery = useProjectMilestones(projectId, { page: 1, limit: 100, sortBy: "createdAtDesc" });
  const sprintsQuery = useProjectSprints(projectId, { enabled: isAgile && isOpen });

  const projectTasksQuery = useQuery({
    queryKey: ["project-tasks", projectId, "parent-picker"],
    queryFn: () =>
      retrieveProjectTasksPaginated({ projectId, page: 1, limit: 100, sortBy: "createdAtDesc" }),
    enabled: !!projectId && isOpen,
    refetchOnWindowFocus: false,
  });

  const activeSprints = React.useMemo(
    () => (sprintsQuery.sprints || []).filter((sprint) => sprint.status !== "Completed"),
    [sprintsQuery.sprints],
  );
  const parentTaskCandidates = React.useMemo(
    () =>
      (projectTasksQuery.data?.data ?? [])
        .filter((candidate) => candidate.id !== task?.id)
        .map((candidate) => ({
          id: candidate.id,
          label: `${candidate.key ?? ""} ${candidate.title}`.trim(),
        })),
    [projectTasksQuery.data?.data, task?.id],
  );

  const { form, isPending, onSubmit, error, aiBlockerRisk, clearAiBlockerRisk } = useProjectTaskUpload({
    projectId,
    task,
    onSuccess: (risk) => {
      setResetFilesTrigger(t => t + 1);
      if (!risk) {
        onClose();
      }
    }
  });

  const handleClose = () => {
    form.reset();
    setResetFilesTrigger(t => t + 1);
    clearAiBlockerRisk();
    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle>
            {task?.id ? t("actions.updateTask") : t("actions.createTask")}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="overflow-y-auto space-y-6 p-6 pt-0 flex-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("upload.form.placeholders.title")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      placeholder={t("upload.form.placeholders.description")}
                      initialContent={task?.description || ""}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskType).map((type) => (
                          <DotBadgeSelectItem
                            key={type}
                            value={type}
                            dotColorClass={projectTaskTypeDotColors[type.toUpperCase()]}
                            label={t(`types.${type.toLowerCase()}`)}
                          />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.priority")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectPriority")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskPriority).map((p) => (
                          <DotBadgeSelectItem
                            key={p}
                            value={p}
                            dotColorClass={projectTaskPriorityDotColors[p.toUpperCase()]}
                            label={t(`priorityLabels.${p.toLowerCase()}`)}
                          />
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.status")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectStatus")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EnumProjectTaskStatus)
                          .filter((s) => isAgile || !["TESTING", "IN_REVIEW"].includes(s))
                          .map((s) => (
                            <DotBadgeSelectItem
                              key={s}
                              value={s}
                              dotColorClass={projectTaskStatusDotColors[s.toUpperCase()]}
                              label={t(`statusLabels.${s.toLowerCase()}`)}
                            />
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAgile && (
                <FormField
                  control={form.control}
                  name="storyPoints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.points")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder={t("upload.form.placeholders.points", { defaultValue: "e.g. 5" })}
                          value={field.value === 0 || field.value == null ? "" : field.value}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? undefined : Number(v));
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.estimatedHours", { defaultValue: "Estimated hours" })}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder={t("upload.form.placeholders.estimatedHours", { defaultValue: "e.g. 4.5" })}
                        value={field.value === 0 || field.value == null ? "" : field.value}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v === "" ? undefined : Number(v));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.assignee", { defaultValue: "Assignee" })}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} value={field.value || "__none__"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectAssignee", { defaultValue: "Select assignee" })} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Unassigned</SelectItem>
                        {(project?.members || []).map((member) => (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="milestoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.milestone", { defaultValue: "Milestone" })}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} value={field.value || "__none__"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectMilestone", { defaultValue: "Select milestone" })} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {(milestonesQuery.data?.data || []).map((milestone) => (
                          <SelectItem key={milestone.id} value={milestone.id}>{milestone.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentTaskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("upload.form.labels.parentTask", { defaultValue: "Parent task" })}</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} value={field.value || "__none__"}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("upload.form.placeholders.selectParent", { defaultValue: "Make this a subtask…" })} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">{t("upload.form.placeholders.noParent", { defaultValue: "No parent (top-level task)" })}</SelectItem>
                        {parentTaskCandidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isAgile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="epicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.epic", { defaultValue: "Epic" })}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} value={field.value || "__none__"}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("upload.form.placeholders.selectEpic", { defaultValue: "Select epic" })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {(epicsQuery.data?.data || []).map((epic) => (
                            <SelectItem key={epic.id} value={epic.id}>{epic.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("upload.form.labels.sprint", { defaultValue: "Sprint" })}</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} value={field.value || "__none__"}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("upload.form.placeholders.selectSprint", { defaultValue: "Select sprint" })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {activeSprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            <TimeInput
              inputName="dueDate"
              dateLabel={t("upload.form.labels.dueDate", { defaultValue: "Due Date" })}
              timeLabel={t("upload.form.labels.dueTime", { defaultValue: "Time" })}
              allowEmpty
              emptyPlaceholder={t("upload.form.placeholders.dueDate", { defaultValue: "No due date" })}
              minDate={project?.startTime}
              maxDate={project?.endTime}
            />

            <div className="space-y-3 rounded-lg border p-4">
              <h4 className="text-sm font-medium">{t("upload.form.labels.aiOptions", { defaultValue: "AI options" })}</h4>
              <FormField
                control={form.control}
                name="aiSuggestAssignee"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>{t("upload.form.labels.aiSuggestAssignee", { defaultValue: "Suggest assignee if empty" })}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aiSuggestEstimate"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>{t("upload.form.labels.aiSuggestEstimate", { defaultValue: "Suggest estimate if empty" })}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aiSuggestBlockerRisk"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>{t("upload.form.labels.aiSuggestBlockerRisk", { defaultValue: "Compute blocker risk" })}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {aiBlockerRisk && (
              <div
                className={cn(
                  "rounded-md border p-4 space-y-2 text-sm",
                  aiBlockerRisk.level === "HIGH" && "pm-surface-risk-high",
                  aiBlockerRisk.level === "MEDIUM" && "pm-surface-risk-medium",
                  aiBlockerRisk.level === "LOW" && "pm-surface-risk-low",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">AI blocker risk</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-semibold",
                      aiBlockerRisk.level === "HIGH" && "pm-badge-risk-high",
                      aiBlockerRisk.level === "MEDIUM" && "pm-badge-risk-medium",
                      aiBlockerRisk.level === "LOW" && "pm-badge-risk-low",
                    )}
                  >
                    {aiBlockerRisk.level}
                  </span>
                </div>
                {aiBlockerRisk.flags?.length ? (
                  <ul className="list-disc pl-5 text-xs text-muted-foreground">
                    {aiBlockerRisk.flags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No risk flags detected.</p>
                )}
                <div className="flex justify-end pt-1">
                  <Button size="sm" variant="outline" type="button" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            )}

            <AttachementUpload
              inputName="attachments"
              previews={(task?.attachments || []).map((attachment) =>
                typeof attachment === "string"
                  ? attachment
                  : attachment.url || attachment.attachment || "",
              ).filter(Boolean)}
              resetTrigger={resetFilesTrigger}
            />

            {error && <ErrorBanner error={error} />}

            <div className="flex-1 flex justify-end gap-2 pt-2 border-t">
              <Button type="button" onClick={handleClose} variant="secondary" disabled={isPending}>
                {t("actions.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("actions.creating") : (task?.id ? t("actions.updateTask") : t("actions.createTask"))}
              </Button>
            </div>

          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
