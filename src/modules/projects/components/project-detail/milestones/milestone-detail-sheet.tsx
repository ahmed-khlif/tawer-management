"use client";

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, Flag, GitBranch, ListChecks, Loader2, Plus, Sparkles } from "lucide-react";
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

function getMilestoneState(milestone: Milestone) {
  const overdue =
    !!milestone.dueDate &&
    !milestone.completedAt &&
    new Date(milestone.dueDate).getTime() < Date.now();

  if (milestone.completedAt) {
    return {
      label: "Completed",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckCircle2,
    };
  }

  if (overdue) {
    return {
      label: "Overdue",
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: AlertTriangle,
    };
  }

  if (milestone.progress > 0) {
    return {
      label: "In Progress",
      className: "bg-primary/10 text-primary border-primary/20",
      icon: Flag,
    };
  }

  return {
    label: "Upcoming",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: CalendarClock,
  };
}

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
  const router = useRouter();
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
  const state = milestone ? getMilestoneState(milestone) : null;

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
                <Card className="overflow-hidden border-border/60">
                  <CardContent className="space-y-4 p-0">
                    <div className="border-b bg-muted/30 px-5 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {state ? (
                              <Badge variant="outline" className={cn("rounded-full font-semibold", state.className)}>
                                <state.icon className="mr-1 size-3.5" />
                                {state.label}
                              </Badge>
                            ) : null}
                            {milestone.aiRiskLevel ? (
                              <Badge variant="outline" className="rounded-full text-[10px] font-semibold uppercase tracking-wide">
                                <Sparkles className="mr-1 size-3" />
                                AI {milestone.aiRiskLevel.toLowerCase()} risk
                              </Badge>
                            ) : null}
                          </div>
                          <p className="max-w-2xl text-sm text-muted-foreground">
                            {milestone.description || "This milestone tracks a key delivery checkpoint for the project."}
                          </p>
                        </div>
                        {countdown ? (
                          <div className="rounded-xl border bg-background px-4 py-3 text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Target window
                            </p>
                            <p className="text-sm font-semibold">{countdown}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
                      <div className="rounded-xl border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Due date
                        </p>
                        <p className="mt-1 text-sm font-semibold">{formatDate(milestone.dueDate)}</p>
                      </div>
                      <div className="rounded-xl border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Linked tasks
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {milestone.totalTasks} tasks
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {milestone.doneTasks} completed
                        </p>
                      </div>
                      <div className="rounded-xl border bg-card px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Progress
                        </p>
                        <p className="mt-1 text-sm font-semibold">{Math.round(milestone.progress)}%</p>
                        <Progress value={milestone.progress} className="mt-2 h-1.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Due</p>
                    <p className="mt-1 font-medium">{formatDate(milestone.dueDate)}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Completed</p>
                    <p className="mt-1 font-medium">
                      {milestone.completedAt ? formatDate(milestone.completedAt) : "Not yet"}
                    </p>
                  </div>
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
                            className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-primary">
                                  {task.key}
                                </span>
                                <p className="truncate text-sm font-medium">
                                  {task.title}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
                                  {task.type}
                                </Badge>
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
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {task.storyPoints ? (
                                <Badge variant="outline" className="pm-badge-points border">
                                  {task.storyPoints} pts
                                </Badge>
                              ) : null}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  onOpenChange(false);
                                  router.push(
                                    `/dashboard/projects/${projectId}?tab=tasks&sub=kanban&taskId=${task.id}`,
                                  );
                                }}
                              >
                                <GitBranch className="mr-2 size-4" />
                                Open task
                              </Button>
                            </div>
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

               {milestone.aiRecommendations?.length ? (
                 <Card>
                   <CardHeader>
                     <CardTitle>AI planning notes</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-3">
                     <div className="flex items-center gap-2">
                       <Badge variant="outline" className="rounded-full font-semibold">
                         <Sparkles className="mr-1 size-3.5" />
                         {milestone.aiRiskLevel ? `Risk: ${milestone.aiRiskLevel}` : "AI insight"}
                       </Badge>
                     </div>
                     <ul className="space-y-2 text-sm text-muted-foreground">
                       {milestone.aiRecommendations.map((note, index) => (
                         <li key={`${note}-${index}`} className="flex items-start gap-2">
                           <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
                           <span>{note}</span>
                         </li>
                       ))}
                     </ul>
                   </CardContent>
                 </Card>
               ) : null}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
