"use client";

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SetReminderButton from "@/modules/reminders/components/set-reminder-button";
import { Milestone } from "@/modules/projects/types/project-milestones";
import useMilestone from "@/modules/projects/hooks/milestones/use-milestone";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  projectTaskStatusClasses,
  projectTaskPriorityClasses,
} from "@/modules/projects/utils/badges/project-task-badges";

interface MilestoneDetailSheetProps {
  projectId: string;
  milestone: Milestone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (milestone: Milestone) => void;
  onComplete?: (milestone: Milestone) => void;
  isCompleting?: boolean;
  canComplete?: boolean;
  canCreateReminder?: boolean;
  canCreateTask?: boolean;
  onCreateTask?: (milestone: Milestone) => void;
}

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), "PPP p") : "Not scheduled";

export default function MilestoneDetailSheet({
  projectId,
  milestone: summaryMilestone,
  open,
  onOpenChange,
  onEdit,
  onComplete,
  isCompleting = false,
  canComplete = false,
  canCreateReminder = false,
  canCreateTask = false,
  onCreateTask,
}: MilestoneDetailSheetProps) {
  // Pull the canonical milestone from
  // `GET /projects/:projectId/milestones/:milestoneId` so the sheet always
  // reflects the latest progress and AI fields.
  const { data: detailedMilestone } = useMilestone(projectId, summaryMilestone?.id, {
    enabled: open && !!summaryMilestone?.id,
  });
  const milestone = detailedMilestone ?? summaryMilestone;

  // Tasks are natively fetched within detailedMilestone.

  const countdown =
    milestone?.dueDate
      ? formatDistanceToNow(new Date(milestone.dueDate), { addSuffix: true })
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        {!milestone ? null : (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between gap-2 pe-6">
                <SheetTitle>{milestone.name}</SheetTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {canCreateReminder ? (
                    <SetReminderButton
                      projectId={projectId}
                      entityType="MILESTONE"
                      entityId={milestone.id}
                      entityLabel={`Milestone: ${milestone.name}`}
                      defaultMessage={`Reminder for milestone ${milestone.name}`}
                    />
                  ) : null}
                  {canCreateTask && onCreateTask ? (
                    <Button variant="outline" size="sm" onClick={() => onCreateTask(milestone)}>
                      <Plus className="mr-2 size-4" /> Task
                    </Button>
                  ) : null}
                  {onEdit ? (
                    <Button variant="outline" size="sm" onClick={() => onEdit(milestone)}>
                      Edit
                    </Button>
                  ) : null}
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="h-[calc(100vh-6rem)] pr-4">
              <div className="space-y-4 p-1">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Milestone progress</CardTitle>
                    <div className="flex items-center gap-2">
                      {canComplete && onComplete && !milestone.completedAt ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onComplete(milestone)}
                          disabled={isCompleting}
                        >
                          <CheckCircle2 className="mr-1 size-4" />
                          Mark complete
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        milestone.completedAt
                          ? "pm-badge-task-done border"
                          : "pm-badge-task-todo border"
                      }
                    >
                      {milestone.completedAt ? "Completed" : "Open"}
                    </Badge>
                    {countdown ? (
                      <span className="text-xs text-muted-foreground">{countdown}</span>
                    ) : null}
                  </div>
                  <Progress value={milestone.progress} />
                  <p className="text-sm text-muted-foreground">
                    {milestone.doneTasks}/{milestone.totalTasks} linked tasks are done.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium">Due:</span> {formatDate(milestone.dueDate)}</p>
                  <p>
                    <span className="font-medium">Completed:</span>{" "}
                    {milestone.completedAt ? formatDate(milestone.completedAt) : "Not yet"}
                  </p>
                </CardContent>
              </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Description</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-muted-foreground">
                     {milestone.description || "No description provided."}
                   </p>
                 </CardContent>
               </Card>

               <Card>
                 <CardHeader>
                   <CardTitle>Linked tasks</CardTitle>
                 </CardHeader>
                 <CardContent>
                   {milestone.tasks?.length ? (
                      <div className="space-y-2">
                        {milestone.tasks.map((task) => (
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
                            This milestone does not have any linked tasks yet.
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
