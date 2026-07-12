"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
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
import { useTranslations } from "next-intl";
import { ErrorBanner } from "@/components/error-banner";
import { DotBadgeSelectItem } from "../../shared/dot-badge-option";
import { ProjectTaskType, EnumProjectTaskType, EnumProjectTaskStatus, EnumProjectTaskPriority } from "@/modules/projects/types/project-tasks";
import useProjectTaskUpload from "../../../hooks/tasks/use-project-task-upload";
import useProject from "../../../hooks/projects/use-project";
import useProjectMilestones from "../../../hooks/milestones/use-project-milestones";
import useProjectSprints from "../../../hooks/sprints/use-project-sprints";
import useProjectTask from "../../../hooks/tasks/use-project-task";
import { retrieveProjectTasksPaginated } from "../../../services/api/project-tasks";
import { projectTaskStatusDotColors, projectTaskPriorityDotColors, projectTaskTypeDotColors } from "../../../utils/badges/project-task-badges";
import AttachementUpload from "@/modules/projects/components/project-detail/project-task/attachments";
import { previewTaskAi } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import PmAiDescriptionAssist from "@/modules/projects/components/shared/pm-ai-description-assist";
import type { TaskAiPreviewResult } from "@/modules/projects/types/project-ai-preview";
import { resolveAssetUrl } from "@/lib/resolve-asset-url";

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
  const milestonesQuery = useProjectMilestones(projectId, { page: 1, limit: 100, sortBy: "createdAtDesc" });
  const sprintsQuery = useProjectSprints(projectId, { enabled: isAgile && isOpen });
  const detailedTaskQuery = useProjectTask(projectId, task?.id, {
    enabled: isOpen && !!task?.id,
  });

  const effectiveTask = React.useMemo<ProjectTaskType | null | undefined>(() => {
    if (!task) return task;
    const detailedTask = detailedTaskQuery.data;
    if (!detailedTask) return task;

    return {
      ...task,
      ...detailedTask,
      assignee: detailedTask.assignee ?? task.assignee,
      epic: detailedTask.epic ?? task.epic,
      subTasks: detailedTask.subTasks ?? task.subTasks,
      comments: detailedTask.comments ?? task.comments,
      dependencies: detailedTask.dependencies ?? task.dependencies,
      labels: detailedTask.labels ?? task.labels,
      timeEntries: detailedTask.timeEntries ?? task.timeEntries,
      attachments: detailedTask.attachments ?? task.attachments,
    };
  }, [task, detailedTaskQuery.data]);

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

  const { form, isPending, onSubmit, error, clearAiBlockerRisk } = useProjectTaskUpload({
    projectId,
    task: effectiveTask,
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

  const [taskAiPreview, setTaskAiPreview] = React.useState<TaskAiPreviewResult | null>(null);
  const taskAiMutation = useMutation({
    mutationFn: (reason: "assignee" | "estimate" | "risk") => {
      const values = form.getValues();
      return previewTaskAi(projectId, {
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        priority: values.priority,
        status: values.status,
        storyPoints: typeof values.storyPoints === "number" && values.storyPoints > 0 ? values.storyPoints : undefined,
        estimatedHours: typeof values.estimatedHours === "number" && values.estimatedHours > 0 ? values.estimatedHours : undefined,
        dueDate: values.dueDate || undefined,
        assigneeId: values.assigneeId || undefined,
        milestoneId: values.milestoneId || undefined,
        sprintId: values.sprintId || undefined,
        dependencyIds: reason === "risk" ? [] : undefined,
      });
    },
    onSuccess: (response) => setTaskAiPreview(response),
  });

  const watchedTitle = form.watch("title");
  const watchedDescription = form.watch("description");
  const watchedType = form.watch("type");
  const watchedPriority = form.watch("priority");
  const watchedStatus = form.watch("status");
  const watchedAssigneeId = form.watch("assigneeId");
  const watchedEstimatedHours = form.watch("estimatedHours");
  const watchedStoryPoints = form.watch("storyPoints");
  const canSuggestAssignee = !!watchedTitle?.trim() && !!watchedType && !!watchedPriority;
  const canSuggestEstimate =
    !!watchedTitle?.trim() && (!!watchedDescription?.trim() || !!watchedType || (typeof watchedStoryPoints === "number" && watchedStoryPoints > 0));
  const canCheckRisk = !!watchedTitle?.trim() && !!watchedStatus;

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
              render={({ field: { value, onChange, name, ...field } }) => (
                <FormItem>
                  <FormLabel>{t("upload.form.labels.description")}</FormLabel>
                  <FormControl>
                    <TextEditor
                      placeholder={t("upload.form.placeholders.description")}
                      initialContent={effectiveTask?.description || ""}
                      value={typeof value === "string" ? value : ""}
                      onChange={onChange}
                      name={name}
                      {...field}
                    />
                  </FormControl>
                  <PmAiDescriptionAssist
                    entityType="TASK"
                    projectId={projectId}
                    title={form.watch("title")}
                    description={typeof value === "string" ? value : ""}
                    onApply={(value) => form.setValue("description", value, { shouldDirty: true })}
                  />
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

            <PmAiAssistPanel
              title="AI Task Assist"
              description="Ask AI for the next useful action once the task has enough context."
              actions={[
                {
                  id: "assignee",
                  label: "Suggest assignee",
                  onClick: () => taskAiMutation.mutate("assignee"),
                  disabled: !canSuggestAssignee,
                  hint: "Add a task title, type, and priority first.",
                  loading: taskAiMutation.isPending,
                  priority: !watchedAssigneeId,
                },
                {
                  id: "estimate",
                  label: "Suggest estimate",
                  onClick: () => taskAiMutation.mutate("estimate"),
                  disabled: !canSuggestEstimate,
                  hint: "Add a title and either description, task type, or story points first.",
                  loading: taskAiMutation.isPending,
                  priority: !watchedEstimatedHours,
                },
                {
                  id: "risk",
                  label: "Check blocker risk",
                  onClick: () => taskAiMutation.mutate("risk"),
                  disabled: !canCheckRisk,
                  hint: "Add a title and status first.",
                  loading: taskAiMutation.isPending,
                },
              ]}
            >
              {taskAiPreview?.assignmentRecommendations?.length ? (
                <PmAiSuggestionCard
                  title="Suggested assignees"
                  onDismiss={() => setTaskAiPreview(null)}
                >
                  <div className="space-y-2">
                    {taskAiPreview.assignmentRecommendations.map((candidate) => (
                      <div key={candidate.userId} className="flex items-start justify-between gap-3 rounded-lg border bg-muted/10 p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{candidate.userName || candidate.userId}</p>
                          <p className="text-xs text-muted-foreground">
                            Score {candidate.totalScore.toFixed(1)} · workload {candidate.workloadScore.toFixed(1)} · fit {candidate.historicalFitScore.toFixed(1)}
                          </p>
                          {candidate.rationale ? (
                            <p className="mt-1 text-xs text-muted-foreground">{candidate.rationale}</p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => form.setValue("assigneeId", candidate.userId, { shouldDirty: true })}
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </PmAiSuggestionCard>
              ) : null}

              {taskAiPreview?.estimatePrediction ? (
                <PmAiSuggestionCard
                  title="Suggested estimate"
                  badge={`${Math.round(taskAiPreview.estimatePrediction.confidence * 100)}% confidence`}
                  onDismiss={() => setTaskAiPreview(null)}
                  footer={
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => form.setValue("estimatedHours", taskAiPreview.estimatePrediction.predictedHours, { shouldDirty: true })}
                    >
                      Apply estimate
                    </Button>
                  }
                >
                  <p className="text-lg font-semibold">{taskAiPreview.estimatePrediction.predictedHours}h</p>
                  {taskAiPreview.estimatePrediction.reasonCodes?.length ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Why this estimate</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                        {taskAiPreview.estimatePrediction.reasonCodes.map((code) => (
                          <li key={code}>{code}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {taskAiPreview.estimatePrediction.riskFlags?.length ? (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Risk flags</p>
                      <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
                        {taskAiPreview.estimatePrediction.riskFlags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </PmAiSuggestionCard>
              ) : null}

              {taskAiPreview?.blockerRisk ? (
                <PmAiSuggestionCard
                  title="Blocker risk"
                  badge={taskAiPreview.blockerRisk.level}
                  onDismiss={() => setTaskAiPreview(null)}
                  className={cn(
                    taskAiPreview.blockerRisk.level === "HIGH" && "pm-surface-risk-high",
                    taskAiPreview.blockerRisk.level === "MEDIUM" && "pm-surface-risk-medium",
                    taskAiPreview.blockerRisk.level === "LOW" && "pm-surface-risk-low",
                  )}
                >
                  {taskAiPreview.blockerRisk.flags?.length ? (
                    <ul className="list-disc pl-4 text-xs text-muted-foreground">
                      {taskAiPreview.blockerRisk.flags.map((flag) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">No blocker warnings were detected.</p>
                  )}
                </PmAiSuggestionCard>
              ) : null}
            </PmAiAssistPanel>

            <AttachementUpload
              inputName="attachments"
              previews={(task?.attachments || []).map((attachment) =>
                typeof attachment === "string"
                  ? resolveAssetUrl(attachment)
                  : resolveAssetUrl(attachment.url || attachment.attachment || ""),
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
