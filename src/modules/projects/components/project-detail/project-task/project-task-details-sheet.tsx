import React from "react";
import { dateToString } from "@/utils/date";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import FilePreview from "reactjs-file-preview";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import CustomDialog from "@/components/custom-dialog";
import DeletionConfirmationDialog from "@/modules/users/components/deletion/deletion-confirmation-dialog";

import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import {
  projectTaskPriorityClasses,
  projectTaskTypeClasses,
  resolveTaskStatusStyle,
} from "../../../utils/badges/project-task-badges";
import { resolveAssignee } from "../../../utils/resolve-assignee";
import { deleteProjectTask, uploadProjectTask } from "@/modules/projects/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useProject from "../../../hooks/projects/use-project";
import useProjectPermissions from "../../../hooks/permissions/use-project-permissions";
import useProjectTasks from "../../../hooks/tasks/use-project-tasks";
import useTaskStatuses from "../../../hooks/tasks/use-task-statuses";
import useProjectTask from "../../../hooks/tasks/use-project-task";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { previewTaskAi } from "@/modules/projects/services/api/project-ai-preview";
import { PmAiAssistPanel, PmAiSuggestionCard } from "@/modules/projects/components/shared/pm-ai-assist";
import type { TaskAiPreviewResult } from "@/modules/projects/types/project-ai-preview";

import SetReminderButton from "@/modules/reminders/components/set-reminder-button";
import { TaskSubtasksSection } from "./task-subtasks-section";
import { TaskAttachmentsSection } from "./task-attachments-section";
import { TaskCommentsSection } from "./task-comments-section";
import { TaskTimeEntriesSection } from "./task-time-entries-section";
import { TaskDependenciesSection } from "./task-dependencies-section";
import { TaskLabelsSection } from "./task-labels-section";

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  task: ProjectTaskType | null;
  onEditClick: (task?: ProjectTaskType | null) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function ProjectTaskDetailSheet({ projectId, isOpen, onClose, task: summaryTask, onEditClick, canEdit = false, canDelete = false }: Props) {
  const t = useTranslations("modules.projects.project.taskAttributes");
  const queryClient = useQueryClient();
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = React.useState(false);
  const [isDeletingTask, setIsDeletingTask] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const { project } = useProject(projectId);
  const { user } = useCurrentUser();
  const permissions = useProjectPermissions(projectId);
  const { tasks: allTasks } = useProjectTasks(projectId);
  const { list: customStatusesQuery } = useTaskStatuses(projectId);
  const customStatusColorByName = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const status of customStatusesQuery.data ?? []) {
      if (status.color) map[status.name.trim().toLowerCase()] = status.color;
    }
    return map;
  }, [customStatusesQuery.data]);
  const [taskAiPreview, setTaskAiPreview] = React.useState<TaskAiPreviewResult | null>(null);

  // Fetch the full task detail (description, comments, dependencies, labels,
  // time entries, …) — only available on `GET /projects/:projectId/tasks/:taskId`,
  // not on the list endpoint that powers the table view.
  const { data: detailedTask, isLoading: isTaskDetailLoading } = useProjectTask(
    projectId,
    summaryTask?.id,
    { enabled: isOpen && !!summaryTask?.id },
  );

  // Prefer the freshly fetched detail; fall back to the list summary while
  // the request is in-flight so the sheet opens instantly.
  const task = detailedTask
    ? {
        ...summaryTask,
        ...detailedTask,
        assignee: detailedTask.assignee ?? summaryTask?.assignee,
      }
    : summaryTask;

  const taskAiMutation = useMutation({
    mutationFn: () => {
      if (!task) {
        throw new Error("Task detail is not available yet.");
      }

      return previewTaskAi(projectId, {
        title: task.title,
        description: task.description || undefined,
        type: task.type,
        priority: task.priority,
        status: task.status,
        storyPoints: typeof task.storyPoints === "number" ? task.storyPoints : undefined,
        estimatedHours: typeof task.estimatedHours === "number" ? task.estimatedHours : undefined,
        dueDate: task.dueDate || undefined,
        assigneeId: typeof task.assigneeId === "string" ? task.assigneeId : undefined,
        milestoneId: task.milestoneId || undefined,
        sprintId: task.sprintId || undefined,
        dependencyIds: task.dependencies?.map((dependency) => dependency.blockingTaskId).filter(Boolean) as string[] | undefined,
      });
    },
    onSuccess: (response) => setTaskAiPreview(response),
    onError: () => toast.error("Failed to load AI task suggestions."),
  });

  const handleDeleteTask = async () => {
    if (!task) return;
    setIsDeletingTask(true);
    try {
      await deleteProjectTask(projectId, task.id);
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-task", projectId, task.id] });
      toast.success("Task deleted");
      setIsDeleteTaskOpen(false);
      onClose();
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setIsDeletingTask(false);
    }
  };

  if (!task) return null;

  const assignee = resolveAssignee(task.assigneeId, project?.members);
  const assigneeFallback =
    typeof task.assigneeId === "string" && task.assigneeId.length > 0
      ? task.assigneeId
      : t("unassigned", { defaultValue: "Unassigned" });
  const assigneeName =
    task.assignee?.name ||
    (user && user.id === task.assigneeId ? user.name : undefined) ||
    assignee?.name ||
    assigneeFallback;

  const handleAssignCandidate = async (assigneeId: string) => {
    if (!task) return;
    try {
      // PATCH semantics — only send the field we're changing. Sending the full
      // task often fails backend `@IsUUID/@IsDateString` validation when other
      // optional fields contain empty strings, Date objects, or null mismatches.
      await uploadProjectTask({
        projectId,
        id: task.id,
        task: { assigneeId },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project-task", projectId, task.id] });
      toast.success("Task assignee updated");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.details)
          ? err.response.data.details.map((d: any) => d?.constraints && Object.values(d.constraints).join(", ")).filter(Boolean).join(" • ")
          : null) ||
        "Failed to update assignee";
      toast.error(message);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <div className="flex items-center justify-between pe-6">
              <SheetTitle className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">{task.key}</span>
                {task.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                {permissions.canCreateReminder ? (
                  <SetReminderButton
                    projectId={projectId}
                    entityType="TASK"
                    entityId={task.id}
                    entityLabel={`Task: ${task.title}`}
                    defaultMessage={`Reminder for task ${task.title}`}
                  />
                ) : null}
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEditClick(task)}>
                    <Edit className="mr-1 size-4" />
                    {t("edit")}
                  </Button>
                )}
                {canDelete && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setIsDeleteTaskOpen(true)}><Trash2 className="size-4" /></Button>}
              </div>
            </div>
            <div className="flex items-center gap-2 capitalize">
              {task.type && (
                <Badge variant="outline" className={projectTaskTypeClasses[task.type.toUpperCase()]}>
                  {task.type}
                </Badge>
              )}
              {task.status && (() => {
                const badge = resolveTaskStatusStyle(task.status, customStatusColorByName);
                return (
                  <Badge variant="outline" className={badge.className} style={badge.style}>
                    {task.status.replace(/_/g, " ")}
                  </Badge>
                );
              })()}
              {task.priority && (
                <Badge variant="outline" className={projectTaskPriorityClasses[task.priority.toUpperCase()]}>
                  {task.priority}
                </Badge>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 p-4">
            {isTaskDetailLoading && !detailedTask ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t("form.labels.description")}</h4>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description || t("noDescription")) }} className="text-muted-foreground text-sm prose dark:prose-invert max-w-none" />
              </div>
            )}

            <FieldSet>
              <FieldLegend variant="label" className="mb-1">
                {t("form.labels.details", { defaultValue: "Details" })}
              </FieldLegend>
              <FieldGroup className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                {task.dueDate ? (
                  <Field>
                    <FieldContent>
                      <FieldLabel>{t("form.labels.dueDate")}</FieldLabel>
                      <FieldDescription>
                        {format(
                          new Date(task.dueDate),
                          "MMM d, yyyy - h:mm a",
                        )}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                ) : null}
                {typeof task.storyPoints === "number" &&
                task.storyPoints > 0 ? (
                  <Field>
                    <FieldContent>
                      <FieldLabel>{t("points")}</FieldLabel>
                      <FieldDescription>{task.storyPoints}</FieldDescription>
                    </FieldContent>
                  </Field>
                ) : null}
                {typeof task.estimatedHours === "number" &&
                task.estimatedHours > 0 ? (
                  <Field>
                    <FieldContent>
                      <FieldLabel>
                        {t("form.labels.estimatedHours", {
                          defaultValue: "Estimated Hours",
                        })}
                      </FieldLabel>
                      <FieldDescription>
                        {task.estimatedHours}h
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                ) : null}
                {typeof task.actualHours === "number" &&
                task.actualHours > 0 ? (
                  <Field>
                    <FieldContent>
                      <FieldLabel>
                        {t("form.labels.actualHours", {
                          defaultValue: "Actual Hours",
                        })}
                      </FieldLabel>
                      <FieldDescription>{task.actualHours}h</FieldDescription>
                    </FieldContent>
                  </Field>
                ) : null}
                <Field>
                  <FieldContent>
                    <FieldLabel>
                      {t("form.labels.assignee", {
                        defaultValue: "Assignee",
                      })}
                    </FieldLabel>
                    <FieldDescription>{assigneeName}</FieldDescription>
                  </FieldContent>
                </Field>
                {task.createdAt ? (
                  <Field>
                    <FieldContent>
                      <FieldLabel>{t("form.labels.createdAt")}</FieldLabel>
                      <FieldDescription>
                        {dateToString(new Date(task.createdAt))}
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                ) : null}
              </FieldGroup>
            </FieldSet>

            {permissions.canUseAiSuggestions ? (
              <PmAiAssistPanel
                title="AI Task Tools"
                description="Preview assignment, estimate, and blocker signals without saving changes first."
                actions={[
                  {
                    id: "task-preview",
                    label: "Refresh AI suggestions",
                    onClick: () => taskAiMutation.mutate(),
                    loading: taskAiMutation.isPending,
                    priority: true,
                  },
                ]}
              >
                {taskAiPreview?.assignmentRecommendations?.length ? (
                  <PmAiSuggestionCard title="Suggested assignees" onDismiss={() => setTaskAiPreview(null)}>
                    <div className="space-y-2">
                      {taskAiPreview.assignmentRecommendations.map((candidate) => (
                        <div key={candidate.userId} className="flex items-center justify-between rounded-md border p-3">
                          <div>
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
                            onClick={() => handleAssignCandidate(candidate.userId)}
                            disabled={!permissions.canAssignTask}
                          >
                            Assign
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
                      canEdit ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={async () => {
                            try {
                              await uploadProjectTask({
                                projectId,
                                id: task.id,
                                task: { estimatedHours: taskAiPreview.estimatePrediction.predictedHours },
                              });
                              await queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
                              await queryClient.invalidateQueries({ queryKey: ["project-task", projectId, task.id] });
                              toast.success("Estimate updated");
                            } catch {
                              toast.error("Failed to update estimate");
                            }
                          }}
                        >
                          Apply estimate
                        </Button>
                      ) : undefined
                    }
                  >
                    <p className="text-sm font-medium">
                      Predicted duration: {taskAiPreview.estimatePrediction.predictedHours}h
                    </p>
                    {taskAiPreview.estimatePrediction.reasonCodes?.length ? (
                      <ul className="list-disc pl-5 text-xs text-muted-foreground">
                        {taskAiPreview.estimatePrediction.reasonCodes.map((code) => (
                          <li key={code}>{code}</li>
                        ))}
                      </ul>
                    ) : null}
                    {taskAiPreview.estimatePrediction.riskFlags?.length ? (
                      <ul className="list-disc pl-5 text-xs text-muted-foreground">
                        {taskAiPreview.estimatePrediction.riskFlags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
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
                      <ul className="list-disc pl-5 text-xs text-muted-foreground">
                        {taskAiPreview.blockerRisk.flags.map((flag) => (
                          <li key={flag}>{flag}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">No risk flags detected.</p>
                    )}
                  </PmAiSuggestionCard>
                ) : null}
              </PmAiAssistPanel>
            ) : null}
          </div>

          <FieldSeparator />
          <Tabs defaultValue="comments" className="px-4 pb-4">
            <TabsList className="w-full overflow-x-auto h-auto flex-wrap justify-start bg-muted/50">
              <TabsTrigger value="comments">
                {t("form.sections.comments", { defaultValue: "Comments" })}
                {task.comments?.length ? (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {task.comments.length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="subtasks">
                {t("form.sections.subtasks", { defaultValue: "Subtasks" })}
              </TabsTrigger>
              <TabsTrigger value="dependencies">
                {t("form.sections.dependencies", {
                  defaultValue: "Dependencies",
                })}
              </TabsTrigger>
              <TabsTrigger value="attachments">
                {t("form.sections.attachments", {
                  defaultValue: "Attachments",
                })}
                {task.attachments?.length ? (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {task.attachments.length}
                  </Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="time">
                {t("form.sections.time", { defaultValue: "Time" })}
              </TabsTrigger>
              <TabsTrigger value="labels">
                {t("form.sections.labels", { defaultValue: "Labels" })}
                {task.labels?.length ? (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {task.labels.length}
                  </Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="mt-3">
              <TaskCommentsSection
                projectId={projectId}
                taskId={task.id}
                task={task}
                comments={task.comments}
                permissions={permissions}
              />
            </TabsContent>
            <TabsContent value="subtasks" className="mt-3">
              <TaskSubtasksSection projectId={projectId} task={task} permissions={permissions} />
            </TabsContent>
            <TabsContent value="dependencies" className="mt-3">
              <TaskDependenciesSection
                projectId={projectId}
                task={task}
                availableTasks={allTasks.map((t) => ({
                  id: t.id,
                  title: t.title,
                  status: t.status,
                  key: t.key,
                }))}
                permissions={permissions}
              />
            </TabsContent>
            <TabsContent value="attachments" className="mt-3">
              <TaskAttachmentsSection
                projectId={projectId}
                taskId={task.id}
                attachments={task.attachments}
                onViewAttachment={(url) => {
                  setPreviewUrl(url);
                  setIsPreviewOpen(true);
                }}
                permissions={permissions}
              />
            </TabsContent>
            <TabsContent value="time" className="mt-3">
              <TaskTimeEntriesSection
                projectId={projectId}
                taskId={task.id}
                task={task}
                permissions={permissions}
              />
            </TabsContent>
            <TabsContent value="labels" className="mt-3">
              <TaskLabelsSection
                projectId={projectId}
                task={task}
                permissions={permissions}
              />
            </TabsContent>
          </Tabs>
        </SheetContent>

        <CustomDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} title={t("filePreview")} className="max-w-4xl max-h-[90vh] overflow-auto">
          {previewUrl && <div className="mt-4"><FilePreview preview={previewUrl} /></div>}
        </CustomDialog>
      </Sheet>

      <DeletionConfirmationDialog
        isOpen={isDeleteTaskOpen} isPending={isDeletingTask}
        onOpenChange={(open) => !open && setIsDeleteTaskOpen(false)}
        onConfirm={handleDeleteTask} onCancel={() => setIsDeleteTaskOpen(false)}
        title={t("deletion.title")} description={t("deletion.description")}
      />
    </>
  );
}

export default ProjectTaskDetailSheet;
