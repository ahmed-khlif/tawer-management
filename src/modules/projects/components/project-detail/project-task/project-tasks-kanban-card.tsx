"use client";

import React from "react";
import { formatDistanceToNowStrict, isPast, parseISO } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  Copy,
  GitBranch,
  GripVertical,
  Layers,
  ListTodo,
  Milestone,
} from "lucide-react";
import * as Kanban from "@/components/ui/kanban";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { ProjectMember } from "@/modules/projects/types/projects";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import { AssigneeHoverPill } from "../../shared/assignee-hover-pill";
import { LabelChips } from "../../shared/label-chips";
import { resolveAssignee } from "../../../utils/resolve-assignee";
import {
  epicBadgeClasses,
  projectTaskPriorityClasses,
  projectTaskTypeClasses,
} from "../../../utils/badges/project-task-badges";

interface Props {
  task: ProjectTaskType;
  projectType: string;
  members?: ProjectMember[];
  customStatusColorByName?: Record<string, string>;
  onClick?: () => void;
  onDuplicate?: (e: React.MouseEvent) => void;
}

function formatDueDate(value?: string) {
  if (!value) return null;
  try {
    const date = parseISO(value);
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return null;
  }
}

export default function ProjectTasksKanbanCard({
  task,
  projectType,
  members,
  customStatusColorByName: _customStatusColorByName,
  onClick,
  onDuplicate,
}: Props) {
  const tTasks = useTranslations("modules.projects.tasks");
  const { visibleAttributes } = useProjectTasksStore();

  const isCompleted = task.status === "DONE";
  const priorityKey = task.priority.toLowerCase();
  const typeKey = task.type.toLowerCase();
  const labels = task.labels ?? [];
  const assignee = React.useMemo(() => {
    const resolved = resolveAssignee(task.assigneeId, members);
    if (resolved) return resolved;
    if (task.assignee?.name) {
      const tokens = task.assignee.name.trim().split(/\s+/).filter(Boolean);
      const initials =
        tokens.length >= 2
          ? `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`
          : (tokens[0]?.slice(0, 2) ?? "");
      return {
        name: task.assignee.name,
        initials: initials.toUpperCase() || "?",
        image: task.assignee.image,
        email: task.assignee.email,
      };
    }
    return null;
  }, [members, task.assignee?.email, task.assignee?.image, task.assignee?.name, task.assigneeId]);
  const hasStoryPoints =
    typeof task.storyPoints === "number" && task.storyPoints > 0;
  const dueLabel = formatDueDate(task.dueDate);
  const isOverdue =
    !!task.dueDate && !isCompleted && (() => {
      try {
        return isPast(parseISO(task.dueDate));
      } catch {
        return false;
      }
    })();
  const blockingDependencies = task.dependencies ?? [];
  const subTasks = task.subTasks ?? [];
  const completedSubTasks = subTasks.filter(
    (subTask) => subTask.status === "DONE",
  ).length;
  const epicBadgeStyle = task.epic?.color
    ? {
        borderColor: `${task.epic.color}55`,
        backgroundColor: `${task.epic.color}14`,
        color: task.epic.color,
      }
    : undefined;

  return (
    <Card
      className={cn(
        "group cursor-pointer border border-border/60 bg-card/95 shadow-sm transition-all hover:-translate-y-px hover:shadow-md",
        isCompleted && "opacity-75",
        isOverdue && "border-destructive/30",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <CardContent className="flex flex-col gap-3 py-3">
        <div className="flex items-start gap-2">
          <Kanban.ItemHandle asChild>
            <button
              type="button"
              className="mt-0.5 shrink-0 cursor-grab rounded-sm text-muted-foreground/40 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={(event) => event.stopPropagation()}
              aria-label="Drag task"
            >
              <GripVertical className="size-3.5" />
            </button>
          </Kanban.ItemHandle>

          <Checkbox
            checked={isCompleted}
            className="pointer-events-none mt-0.5 shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                {visibleAttributes.key && (
                  <span className="block text-[10px] font-mono font-bold tracking-[0.18em] text-muted-foreground/60">
                    {task.key}
                  </span>
                )}
                <h4
                  className={cn(
                    "line-clamp-2 text-sm font-medium leading-snug",
                    isCompleted && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                </h4>
              </div>

              {onDuplicate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={onDuplicate}
                      aria-label={tTasks("duplicateTask", {
                        defaultValue: "Duplicate",
                      })}
                    >
                      <Copy className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tTasks("duplicateTask", { defaultValue: "Duplicate" })}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {visibleAttributes.epic && task.epic ? (
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 max-w-full gap-1 border-l-2 text-[10px]",
                    epicBadgeClasses,
                  )}
                  title={task.epic.title}
                  style={epicBadgeStyle}
                >
                  <Layers className="size-2.5" />
                  <span className="max-w-[180px] truncate">{task.epic.title}</span>
                </Badge>
              </div>
            ) : null}

            {(visibleAttributes.type ||
              visibleAttributes.priority ||
              (projectType === "AGILE" &&
                visibleAttributes.points &&
                hasStoryPoints)) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {visibleAttributes.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 text-[10px]",
                      projectTaskTypeClasses[task.type.toUpperCase()],
                    )}
                  >
                    {tTasks(`types.${typeKey}`, { defaultValue: task.type })}
                  </Badge>
                )}
                {visibleAttributes.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 text-[10px]",
                      projectTaskPriorityClasses[task.priority.toUpperCase()],
                    )}
                  >
                    {tTasks(`priorityLabels.${priorityKey}`, {
                      defaultValue: task.priority,
                    })}
                  </Badge>
                )}
                {projectType === "AGILE" &&
                  visibleAttributes.points &&
                  hasStoryPoints && (
                    <Badge
                      variant="outline"
                      className="pm-badge-points h-5 border text-[10px]"
                    >
                      {task.storyPoints} {tTasks("points")}
                    </Badge>
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {dueLabel ? (
            <Badge
              variant="outline"
              className={cn(
                "h-5 gap-1 text-[10px]",
                isOverdue
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border/70 text-muted-foreground",
              )}
            >
              <CalendarClock className="size-2.5" />
              {dueLabel}
            </Badge>
          ) : null}

          {blockingDependencies.length > 0 ? (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300"
            >
              <GitBranch className="size-2.5" />
              {blockingDependencies.length} blocker
              {blockingDependencies.length > 1 ? "s" : ""}
            </Badge>
          ) : null}

          {subTasks.length > 0 ? (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-border/70 text-[10px] text-muted-foreground"
            >
              <ListTodo className="size-2.5" />
              {completedSubTasks}/{subTasks.length} subtasks
            </Badge>
          ) : null}

          {isOverdue ? (
            <Badge
              variant="outline"
              className="h-5 gap-1 border-destructive/30 bg-destructive/10 text-[10px] text-destructive"
            >
              <AlertTriangle className="size-2.5" />
              Needs attention
            </Badge>
          ) : null}
        </div>

        {visibleAttributes.milestone && task.milestoneId ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleAttributes.milestone &&
              typeof task.milestoneId === "string" &&
              task.milestoneId && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-muted text-[10px] text-muted-foreground"
                  title={task.milestoneId}
                >
                  <Milestone className="size-2.5" />
                  {tTasks("milestone", { defaultValue: "Milestone" })}
                </Badge>
              )}
          </div>
        ) : null}

        {labels.length > 0 && <LabelChips labels={labels} max={3} />}

        {subTasks.length > 0 ? (
          <div className="space-y-1.5 rounded-md border border-dashed border-border/70 bg-muted/25 px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Subtask progress</span>
              <span>
                {completedSubTasks}/{subTasks.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${(completedSubTasks / Math.max(subTasks.length, 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>

      {visibleAttributes.assignee && assignee ? (
        <CardFooter className="flex items-center justify-between border-t px-3 py-2">
          <AssigneeHoverPill
            assignee={assignee}
            variant="inline"
            avatarSizeClass="size-5"
          />
          {blockingDependencies.length > 0 ? (
            <span className="text-[10px] text-muted-foreground">
              Waiting on dependencies
            </span>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
