"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  projectTaskPriorityClasses,
  projectTaskTypeClasses,
  epicBadgeClasses,
  resolveTaskStatusStyle,
} from "@/modules/projects/utils/badges/project-task-badges";
import { resolveAssignee } from "@/modules/projects/utils/resolve-assignee";
import { ProjectTaskType } from "@/modules/projects/types/project-tasks";
import { ProjectMember } from "@/modules/projects/types/projects";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Milestone, Layers, Copy } from "lucide-react";
import { useProjectTasksStore } from "@/modules/projects/store/project-tasks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AssigneeHoverPill } from "../../shared/assignee-hover-pill";
import { LabelChips } from "../../shared/label-chips";

interface Props {
  task: ProjectTaskType;
  onClick?: () => void;
  onDuplicate?: (e: React.MouseEvent) => void;
  viewMode: "list" | "grid";
  projectType: string;
  /** Project members, used to resolve assignee UUID → display name. */
  members?: ProjectMember[];
  /** Map of lowercased status name → hex, for project-defined custom statuses. */
  customStatusColorByName?: Record<string, string>;
  isDraggingOverlay?: boolean;
}

export default function ProjectTaskItem({
  task,
  onClick,
  onDuplicate,
  viewMode,
  projectType,
  members,
  customStatusColorByName,
  isDraggingOverlay = false,
}: Props) {
  const t = useTranslations("modules.projects.tasks");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (!isDraggingOverlay ? 0.4 : 0.8) : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const priorityKey = task.priority.toLowerCase();
  const typeKey = task.type.toLowerCase();
  const statusBadge = resolveTaskStatusStyle(task.status, customStatusColorByName);
  const statusLabel = (task.status ?? "").replace(/_/g, " ").toLowerCase();

  const isAgile = projectType === "AGILE";
  const isCompleted = task.status === "DONE";
  const { visibleAttributes } = useProjectTasksStore();
  const labels = task.labels ?? [];
  const assignee = resolveAssignee(task.assigneeId, members);
  const hasStoryPoints =
    typeof task.storyPoints === "number" && task.storyPoints > 0;

  if (viewMode === "grid") {
    return (
      <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Card
          className={cn(
            "group flex h-full cursor-pointer flex-col transition-all hover:shadow-md hover:-translate-y-px",
            isCompleted ? "opacity-70" : "",
          )}
          onClick={onClick}
        >
          <CardContent className="flex h-full flex-col justify-between py-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start space-x-3">
                <Checkbox checked={isCompleted} className="pointer-events-none mt-1" />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start w-full gap-2">
                    {visibleAttributes.key && (
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/60 tracking-wider">
                        {task.key}
                      </span>
                    )}
                    {onDuplicate && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 group-hover:opacity-100 transition-opacity -mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicate(e);
                            }}
                            aria-label={t("duplicateTask", { defaultValue: "Duplicate" })}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("duplicateTask", { defaultValue: "Duplicate" })}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <h3
                    className={cn(
                      "text-md leading-snug font-medium mt-1 line-clamp-2",
                      isCompleted ? "text-muted-foreground line-through" : "",
                    )}
                  >
                    {task.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pl-7">
                {visibleAttributes.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] h-5",
                      projectTaskTypeClasses[task.type.toUpperCase()],
                    )}
                  >
                    {t(`types.${typeKey}`)}
                  </Badge>
                )}
                {isAgile && visibleAttributes.points && hasStoryPoints && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 pm-badge-points border"
                  >
                    {task.storyPoints} {t("points")}
                  </Badge>
                )}
                {isAgile &&
                  visibleAttributes.epic &&
                  typeof task.epicId === "string" &&
                  task.epicId && (
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 gap-1", epicBadgeClasses)}
                      title={task.epicId}
                    >
                      <Layers className="size-2.5" />
                      {t("epic", { defaultValue: "Epic" })}
                    </Badge>
                  )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 border-t py-3">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {visibleAttributes.status && task.status && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", statusBadge.className)}
                    style={statusBadge.style}
                  >
                    {statusLabel}
                  </Badge>
                )}
                {visibleAttributes.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      projectTaskPriorityClasses[task.priority.toUpperCase()],
                      "text-[10px]",
                    )}
                  >
                    {t(`priorityLabels.${priorityKey}`)}
                  </Badge>
                )}
                {labels.length > 0 && <LabelChips labels={labels} max={3} />}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {visibleAttributes.assignee && assignee && (
                  <AssigneeHoverPill assignee={assignee} avatarSizeClass="size-6" />
                )}
              </div>
            </div>

            {visibleAttributes.milestone &&
              typeof task.milestoneId === "string" &&
              task.milestoneId && (
                <div
                  className="flex w-full items-center gap-1 text-muted-foreground"
                  title={task.milestoneId}
                >
                  <Milestone className="size-3" />
                  <span className="text-[10px] truncate">
                    {t("milestone", { defaultValue: "Milestone" })}
                  </span>
                </div>
              )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <Card
        className={cn(
          "group cursor-pointer transition-all hover:shadow-md",
          isCompleted ? "opacity-70" : "",
        )}
        onClick={onClick}
      >
        <CardContent className="flex items-start gap-3 py-4">
          <Checkbox
            checked={isCompleted}
            className="pointer-events-none mt-1"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex grow flex-col space-y-2 min-w-0">
            <div className="flex flex-col items-start justify-between gap-2 lg:flex-row lg:gap-4">
              <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  {visibleAttributes.key && (
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/60 tracking-wider w-14 shrink-0">
                      {task.key}
                    </span>
                  )}
                  <h3
                    className={cn(
                      "text-sm leading-snug font-medium flex-1 truncate",
                      isCompleted ? "text-muted-foreground line-through" : "",
                    )}
                  >
                    {task.title}
                  </h3>
                </div>
                {labels.length > 0 && (
                  <div className="ps-16 lg:ps-0">
                    <LabelChips labels={labels} max={3} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 capitalize shrink-0 ml-auto flex-wrap justify-end">
                {visibleAttributes.milestone &&
                  typeof task.milestoneId === "string" &&
                  task.milestoneId && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 hidden lg:flex gap-1 border-muted text-muted-foreground"
                      title={task.milestoneId}
                    >
                      <Milestone className="size-2.5" />
                      {t("milestone", { defaultValue: "Milestone" })}
                    </Badge>
                  )}
                {visibleAttributes.epic &&
                  typeof task.epicId === "string" &&
                  task.epicId && (
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 hidden md:flex gap-1", epicBadgeClasses)}
                      title={task.epicId}
                    >
                      <Layers className="size-2.5" />
                      {t("epic", { defaultValue: "Epic" })}
                    </Badge>
                  )}
                {visibleAttributes.type && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] h-5 hidden sm:flex",
                      projectTaskTypeClasses[task.type.toUpperCase()],
                    )}
                  >
                    {t(`types.${typeKey}`)}
                  </Badge>
                )}
                {isAgile && visibleAttributes.points && hasStoryPoints && (
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 hidden md:flex pm-badge-points border"
                  >
                    {task.storyPoints} {t("points")}
                  </Badge>
                )}
                {visibleAttributes.status && task.status && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] h-5 capitalize", statusBadge.className)}
                    style={statusBadge.style}
                  >
                    {statusLabel}
                  </Badge>
                )}
                {visibleAttributes.priority && (
                  <Badge
                    variant="outline"
                    className={cn(
                      projectTaskPriorityClasses[task.priority.toUpperCase()],
                      "text-[10px] h-5",
                    )}
                  >
                    {t(`priorityLabels.${priorityKey}`)}
                  </Badge>
                )}
                {visibleAttributes.assignee && assignee && (
                  <AssigneeHoverPill assignee={assignee} avatarSizeClass="size-6" />
                )}
                {onDuplicate && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(e);
                        }}
                        aria-label={t("duplicateTask", { defaultValue: "Duplicate" })}
                      >
                        <Copy className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("duplicateTask", { defaultValue: "Duplicate" })}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
