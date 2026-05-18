"use client";

import { format } from "date-fns";
import { AlertCircle, CalendarRange, Plus, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  projectTaskStatusClasses,
  projectTaskPriorityClasses,
} from "@/modules/projects/utils/badges/project-task-badges";
import { Epic } from "@/modules/projects/types/project-epics";
import SetReminderButton from "@/modules/reminders/components/set-reminder-button";
import useEpic from "@/modules/projects/hooks/epics/use-epic";

interface EpicDetailSheetProps {
  projectId: string;
  epic: Epic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (epic: Epic) => void;
  onCreateTask?: (epic: Epic) => void;
  canCreateTask?: boolean;
  canCreateReminder?: boolean;
}

const formatDate = (value?: string | Date | null) =>
  value ? format(new Date(value), "MMM d, yyyy") : "Not scheduled";

export default function EpicDetailSheet({
  projectId,
  epic: summaryEpic,
  open,
  onOpenChange,
  onEdit,
  onCreateTask,
  canCreateTask = false,
  canCreateReminder = false,
}: EpicDetailSheetProps) {
  // Pull the canonical epic from `GET /projects/:projectId/epics/:epicId`
  // so the sheet always shows the latest counts/tasks/AI fields, not a
  // stale list snapshot.
  const { data: detailedEpic } = useEpic(projectId, summaryEpic?.id, {
    enabled: open && !!summaryEpic?.id,
  });
  const epic = detailedEpic ?? summaryEpic;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        {!epic ? null : (
          <>
            <SheetHeader>
              <SheetTitle>{epic.name}</SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-6rem)] pr-4">
              <div className="space-y-4 p-1">
                <Card className="overflow-hidden border-border/60">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "size-3 rounded-full border",
                              !epic.color && "pm-accent-epic-default",
                            )}
                            style={epic.color ? { backgroundColor: epic.color } : undefined}
                          />
                          {epic.aiRiskLevel ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full text-[10px] font-semibold uppercase tracking-wide",
                                epic.aiRiskLevel === "HIGH"
                                  ? "pm-tone-destructive border"
                                  : epic.aiRiskLevel === "MEDIUM"
                                    ? "pm-tone-warning border"
                                    : "pm-tone-success border",
                              )}
                            >
                              {epic.aiRiskLevel} risk
                            </Badge>
                          ) : null}
                        </div>
                        <div>
                          <p className="text-2xl font-semibold tracking-tight">{epic.name}</p>
                          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            {epic.description || "No description provided."}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Initiative progress
                        </p>
                        <p className="mt-1 text-3xl font-semibold">{Math.round(epic.progress)}%</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarRange className="size-4" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Timeline</p>
                        </div>
                        <p className="mt-2 text-sm font-medium">{formatDate(epic.startDate)} - {formatDate(epic.endDate)}</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Target className="size-4" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Scope</p>
                        </div>
                        <p className="mt-2 text-sm font-medium">{epic.doneTasks}/{epic.totalTasks} tasks done</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Sparkles className="size-4" />
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Sprint anchor</p>
                        </div>
                        <p className="mt-2 text-sm font-medium">{epic.sprintName || "No sprint linked"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Epic progress</CardTitle>
                    <div className="flex items-center gap-2">
                      {canCreateReminder ? (
                        <SetReminderButton
                          projectId={projectId}
                          entityType="CUSTOM"
                          entityId={epic.id}
                          entityLabel={`Epic: ${epic.name}`}
                          defaultMessage={`Reminder for epic ${epic.name}`}
                        />
                      ) : null}
                      {canCreateTask && onCreateTask ? (
                        <Button variant="outline" size="sm" onClick={() => onCreateTask(epic)}>
                          <Plus className="mr-2 size-4" /> Task
                        </Button>
                      ) : null}
                      {onEdit ? (
                        <Button variant="outline" size="sm" onClick={() => onEdit(epic)}>
                          Edit
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "size-4 rounded-full border",
                          !epic.color && "pm-accent-epic-default",
                        )}
                        style={epic.color ? { backgroundColor: epic.color } : undefined}
                      />
                      <Badge variant="outline" className="pm-badge-points border">
                        {epic.doneTasks}/{epic.totalTasks} tasks done
                      </Badge>
                    </div>
                    <Progress value={epic.progress} />
                    <p className="text-sm text-muted-foreground">
                      {epic.progress}% complete
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Start</p>
                      <p className="text-sm font-medium">{formatDate(epic.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">End</p>
                      <p className="text-sm font-medium">{formatDate(epic.endDate)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {epic.description || "No description provided."}
                    </p>
                  </CardContent>
                </Card>

                {epic.aiRecommendations?.length ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="size-4" />
                        AI guidance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {epic.aiRecommendations.map((recommendation) => (
                        <div
                          key={recommendation}
                          className="rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-muted-foreground"
                        >
                          {recommendation}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>Linked tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {epic.tasks?.length ? (
                      <div className="space-y-2">
                        {epic.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="truncate text-sm font-medium">
                                {task.key} - {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {task.status ? (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] capitalize",
                                      projectTaskStatusClasses[
                                        task.status.toUpperCase()
                                      ],
                                    )}
                                  >
                                    {task.status.replace(/_/g, " ").toLowerCase()}
                                  </Badge>
                                ) : null}
                                {task.priority ? (
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[10px] capitalize",
                                      projectTaskPriorityClasses[
                                        task.priority.toUpperCase()
                                      ],
                                    )}
                                  >
                                    {task.priority.toLowerCase()}
                                  </Badge>
                                ) : null}
                              </div>
                            </div>
                            {task.storyPoints ? (
                              <Badge variant="outline" className="pm-badge-points border">
                                {task.storyPoints} pts
                              </Badge>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle>No linked tasks</EmptyTitle>
                          <EmptyDescription>
                            This epic does not have any linked tasks yet.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
