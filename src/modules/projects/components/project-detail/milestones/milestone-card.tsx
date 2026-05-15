"use client";

import { formatDistanceToNow, isPast } from "date-fns";
import { CheckCircle2, Pencil, Trash2, Calendar, ListTodo, Flag, Clock, AlertTriangle } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProjectPermissions } from "@/modules/projects/hooks/permissions/use-project-permissions";
import { Milestone } from "@/modules/projects/types/project-milestones";

interface MilestoneCardProps {
  milestone: Milestone;
  permissions: ProjectPermissions;
  viewMode?: "grid" | "list";
  onOpen: (milestone: Milestone) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: Milestone) => void;
  onComplete: (milestone: Milestone) => void;
}

export default function MilestoneCard({
  milestone,
  permissions,
  viewMode = "grid",
  onOpen,
  onEdit,
  onDelete,
  onComplete,
}: MilestoneCardProps) {
  const dueLabel = milestone.dueDate
    ? formatDistanceToNow(new Date(milestone.dueDate), { addSuffix: true })
    : "No due date";

  const isOverdue =
    milestone.dueDate &&
    isPast(new Date(milestone.dueDate)) &&
    !milestone.completedAt;

  if (viewMode === "grid") {
    return (
      <Card
        className={cn(
          "group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-border/50",
          isOverdue && "border-destructive/30 bg-destructive/5"
        )}
        onClick={() => onOpen(milestone)}
      >
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
                {milestone.name}
              </h3>
              <p className="line-clamp-2 text-xs text-muted-foreground/80 leading-relaxed">
                {milestone.description || "No description provided."}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "h-5 text-[10px] uppercase font-bold tracking-wider px-2",
                milestone.completedAt
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : isOverdue
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}
            >
              {milestone.completedAt ? "Done" : isOverdue ? "Overdue" : "Open"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>{dueLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ListTodo className="size-3.5" />
                <span>
                  {milestone.doneTasks}/{milestone.totalTasks}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Progress 
                value={milestone.progress} 
                className="h-1.5"
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-bold text-muted-foreground">
                  {Math.round(milestone.progress)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
            <div className="flex items-center gap-2">
              {milestone.aiRiskLevel && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "size-2 rounded-full",
                      milestone.aiRiskLevel === "HIGH" ? "bg-destructive" :
                      milestone.aiRiskLevel === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                  </TooltipTrigger>
                  <TooltipContent>AI Risk: {milestone.aiRiskLevel}</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PermissionGuard
                allowed={permissions.canEditMilestone && !milestone.completedAt}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-emerald-500/10 hover:text-emerald-600"
                  onClick={(event) => {
                    event.stopPropagation();
                    onComplete(milestone);
                  }}
                >
                  <CheckCircle2 className="size-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard allowed={permissions.canEditMilestone}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(milestone);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard allowed={permissions.canDeleteMilestone}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(milestone);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md border-border/50",
        milestone.completedAt && "bg-muted/30",
        isOverdue && "border-destructive/20"
      )}
      onClick={() => onOpen(milestone)}
    >
      <CardContent className="flex items-center gap-6 py-3 px-4">
        {/* Status Icon */}
        <div className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border",
          milestone.completedAt ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
          isOverdue ? "bg-destructive/10 border-destructive/20 text-destructive" :
          "bg-amber-500/10 border-amber-500/20 text-amber-600"
        )}>
          {milestone.completedAt ? <CheckCircle2 className="size-5" /> : 
           isOverdue ? <AlertTriangle className="size-5" /> : 
           <Clock className="size-5" />}
        </div>

        {/* Content */}
        <div className="flex grow flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold leading-none truncate group-hover:text-primary transition-colors">
              {milestone.name}
            </h3>
            {isOverdue && (
              <Badge variant="destructive" className="h-4 text-[9px] uppercase px-1.5 font-bold">
                Delayed
              </Badge>
            )}
          </div>
          {milestone.description ? (
            <p className="line-clamp-1 text-[11px] text-muted-foreground/70">
              {milestone.description}
            </p>
          ) : (
            <p className="text-[11px] italic text-muted-foreground/40">
              No description
            </p>
          )}
        </div>

        {/* Metadata Columns */}
        <div className="hidden md:flex items-center gap-8 px-4 border-l border-r border-border/40 h-8">
          <div className="flex flex-col gap-0.5 min-w-[100px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Due Date
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span className={cn(isOverdue && "text-destructive")}>
                {dueLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 min-w-[80px]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Tasks
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <ListTodo className="size-3.5 text-muted-foreground" />
              <span>{milestone.doneTasks}/{milestone.totalTasks}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-1.5 w-32 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
            <span>Progress</span>
            <span className="text-foreground">{Math.round(milestone.progress)}%</span>
          </div>
          <Progress 
            value={milestone.progress} 
            className={cn(
              "h-1.5",
              milestone.completedAt ? "bg-emerald-500/20" : ""
            )} 
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="flex items-center gap-1 opacity-0 transition-all duration-200 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
            <PermissionGuard
              allowed={permissions.canEditMilestone && !milestone.completedAt}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-emerald-500/10 hover:text-emerald-600"
                onClick={(event) => {
                  event.stopPropagation();
                  onComplete(milestone);
                }}
              >
                <CheckCircle2 className="size-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard allowed={permissions.canEditMilestone}>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(milestone);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard allowed={permissions.canDeleteMilestone}>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(milestone);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </PermissionGuard>
          </div>
          <div className="size-8 flex items-center justify-center group-hover:hidden transition-all">
            <Flag className={cn(
              "size-4",
              milestone.completedAt ? "text-emerald-500" : "text-muted-foreground/30"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
